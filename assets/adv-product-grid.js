document.querySelectorAll(".advance-product-grid").forEach((root) => {
  const modal = root.querySelector(".popup-modal-sl");
  const overlay = root.querySelector(".popup-overlay-sl");
  const closeBtn = root.querySelector(".popup-modal-sl .close-btn");
  const innerContent = modal.querySelector(".popup-content");
  const hotspots = root.querySelectorAll(".hotspot-btn");

  // will hold gift variant info for this section (if any)
  let giftVariant = null; // { id, color, size } or null

  /* -----------------------------
     Finds gift variant (runs when modal opens)
     - looks for <script id="gift-sl"> inside the same section (root)
     - finds a variant that has BOTH "black" AND "m" (case-insensitive)
     - stores { id, color, size } in giftVariant
  ------------------------------*/
  function findingGift() {
    giftVariant = null;
    const giftScript = document.getElementById("gift-sl");
    if (!giftScript) {
      console.warn("🎁 Gift script not found");
      return;
    }

    let giftData;
    try {
      giftData = JSON.parse(giftScript.textContent);
    } catch (e) {
      console.error("❌ Failed parsing gift JSON", e);
      return;
    }

    if (!giftData || !Array.isArray(giftData.variants)) {
      console.warn("🎁 Gift JSON has no variants");
      return;
    }

    // option indices
    const optNames = Array.isArray(giftData.options) ? giftData.options : [];
    const colorIndex = optNames.findIndex(
      (n) =>
        n &&
        (n.toLowerCase().includes("color") ||
          n.toLowerCase().includes("colour"))
    );
    const sizeIndex = optNames.findIndex(
      (n) => n && n.toLowerCase().includes("size")
    );

    // find variant with black + m
    for (const v of giftData.variants) {
      const vals = [
        (v.option1 || "").toLowerCase(),
        (v.option2 || "").toLowerCase(),
        (v.option3 || "").toLowerCase(),
      ];

      if (vals.includes("black") && vals.includes("m")) {
        let colorVal =
          colorIndex >= 0 ? v["option" + (colorIndex + 1)] : "Black";
        let sizeVal = sizeIndex >= 0 ? v["option" + (sizeIndex + 1)] : "M";

        giftVariant = {
          id: Number(v.id),
          color: colorVal,
          size: sizeVal,
        };

        console.log("🎁 Gift Variant Found:", giftVariant);
        return giftVariant;
      }
    }

    console.log("🎁 No matching gift variant (Black + M) found");
    return null;
  }

  /* -----------------------------
     Custom Select Initialization
  ------------------------------*/
  function initCustomSelects(scope = document) {
    scope.querySelectorAll(".custom-select-wrapper").forEach((wrapper) => {
      const defaultOption = wrapper.querySelector(".default-option-text");
      const trigger = wrapper.querySelector(".custom-select-trigger");
      if (!trigger) return;

      const triggerText = trigger.querySelector(".trigger-label");
      const options = wrapper.querySelectorAll(".custom-option");
      const hiddenInput = wrapper.querySelector(".hidden-input-select");

      // toggle dropdown
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (defaultOption) {
          triggerText.textContent = defaultOption.textContent;
        }
        wrapper.classList.toggle("open");
      });

      // handle option selection
      options.forEach((option) => {
        option.addEventListener("click", () => {
          options.forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");

          triggerText.textContent = option.textContent;
          if (hiddenInput) {
            hiddenInput.value = option.dataset.value || "";
            hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
          }

          wrapper.classList.remove("open");
        });
      });
    });
  }

  // close dropdowns if clicked outside
  document.addEventListener("click", (e) => {
    document
      .querySelectorAll(".custom-select-wrapper.open")
      .forEach((openSelect) => {
        if (!openSelect.contains(e.target)) {
          openSelect.classList.remove("open");
        }
      });
  });

  /* -----------------------------
     Variant Handlers (per-modal scope)
     - keeps selectedObj updated when a matching variant is found
     - attaches submit handler that sends custom POST to cart/add.js
  ------------------------------*/
  function initVariantHandlers(scope) {
    const jsonEl = scope.querySelector(".adv-grid-json");
    if (!jsonEl) return;

    let productData;
    try {
      productData = JSON.parse(jsonEl.textContent);
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      return;
    }

    if (!productData || !Array.isArray(productData.variants)) {
      console.error("❌ No variants found in productData");
      return;
    }

    const form = scope.querySelector(".adv-modal-form");
    if (!form) return;

    const hiddenIdInput = form.querySelector("input[name='id']");
    if (!hiddenIdInput) return;

    // selected object we maintain when a variant is matched
    let selectedObj = null; // { id, color, size }

    // helper: read option inputs into a map { OptionName: value }
    function readSelectedMap() {
      const map = {};
      const inputs = form.querySelectorAll(
        ".hidden-input-select, .hidden-input-pill"
      );
      inputs.forEach((inp) => {
        const m = String(inp.name).match(/\[([^\]]+)\]/);
        const optName = m ? m[1] : inp.name;
        map[optName] = inp.value || "";
      });
      return map;
    }

    // find option name keys for color/size in productData.options
    const optNames = Array.isArray(productData.options)
      ? productData.options
      : [];
    const colorKey = optNames.find(
      (n) =>
        (n && n.toLowerCase().includes("color")) ||
        (n && n.toLowerCase().includes("colour"))
    );
    const sizeKey = optNames.find((n) => n && n.toLowerCase().includes("size"));

    function updateVariant() {
      const selectedMap = readSelectedMap();
      console.log("👉 Selected map:", selectedMap);

      // ensure all productData.options have a selection
      const missing = optNames.some((optName) => !selectedMap[optName]);
      if (missing) {
        hiddenIdInput.value = "";
        selectedObj = null;
        console.warn("⚠️ Not all options selected yet");
        return;
      }

      // find matching variant by comparing each option in the product's option order
      const matched = productData.variants.find((v) => {
        return optNames.every((optName, idx) => {
          const selectedValue = selectedMap[optName];
          const variantValue = v["option" + (idx + 1)] || "";
          return String(selectedValue) === String(variantValue);
        });
      });

      if (matched) {
        hiddenIdInput.value = matched.id;
        // build selectedObj with color & size (if keys found)
        selectedObj = {
          id: Number(matched.id),
          color: colorKey
            ? selectedMap[colorKey] || ""
            : selectedMap[
                Object.keys(selectedMap).find(
                  (k) => (selectedMap[k] || "").toLowerCase() === "black"
                )
              ] || "",
          size: sizeKey
            ? selectedMap[sizeKey] || ""
            : selectedMap[
                Object.keys(selectedMap).find(
                  (k) => (selectedMap[k] || "").toLowerCase() === "m"
                )
              ] || "",
        };
        console.log(
          "✅ Variant matched:",
          matched,
          "selectedObj:",
          selectedObj
        );
      } else {
        hiddenIdInput.value = "";
        selectedObj = null;
        console.warn("⚠️ No matching variant for selected map");
      }
    }

    // listen for changes from hidden inputs
    form
      .querySelectorAll(".hidden-input-select, .hidden-input-pill")
      .forEach((input) => {
        input.addEventListener("change", () => {
          console.log(`🎯 Option [${input.name}] changed -> ${input.value}`);
          updateVariant();
        });
      });

    // pill click handling (pills should be inside .color-pills-box)
    scope.querySelectorAll(".adv-grid-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pillWrapper = btn.closest(".color-pills-box");
        if (!pillWrapper) return;

        const hiddenInput = pillWrapper.querySelector(".hidden-input-pill");
        if (!hiddenInput) return;

        // Remove active class from siblings
        pillWrapper
          .querySelectorAll(".adv-grid-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Set hidden input + trigger change -> updateVariant will run
        hiddenInput.value = btn.dataset.value || "";
        console.log(
          `🎨 Pill [${btn.dataset.option}] clicked -> ${btn.dataset.value}`
        );
        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Handle dropdown option clicks (we have initCustomSelects set the hidden-input-select change already)
    // we don't need to rebind here.

    // Intercept submit to perform custom add-to-cart with gift logic
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // ensure variant is up-to-date
      updateVariant();

      const mainVariantId = hiddenIdInput.value
        ? Number(hiddenIdInput.value)
        : null;
      if (!mainVariantId) {
        alert("Please select product options before adding to cart.");
        return;
      }

      // build items array
      const items = [{ id: mainVariantId, quantity: 1 }];

      // If we have a giftVariant found earlier and selectedObj exists, compare color+size (lowercased)
      if (
        giftVariant &&
        selectedObj &&
        giftVariant.color &&
        giftVariant.size &&
        selectedObj.color &&
        selectedObj.size
      ) {
        if (
          String(giftVariant.color).toLowerCase() ===
            String(selectedObj.color).toLowerCase() &&
          String(giftVariant.size).toLowerCase() ===
            String(selectedObj.size).toLowerCase()
        ) {
          items.push({ id: Number(giftVariant.id), quantity: 1 });
          console.log("🎁 Gift will be added:", giftVariant);
        } else {
          console.log("🎁 Gift not added (properties did not match)");
        }
      } else {
        if (!giftVariant) console.log("🎁 No gift configured for this section");
        else console.log("🎁 Gift not added (selectedObj incomplete)");
      }

      // POST to cart/add.js with items array
      try {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ items }),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error("Add to cart failed: " + txt);
        }

        const result = await res.json();
        console.log("✅ Added to cart result:", result);

        // redirect to cart or show mini-cart — here we redirect
        window.location.href = "/cart";
      } catch (err) {
        console.error("❌ Add to cart error:", err);
        alert("Failed to add to cart. See console for details.");
      }
    });
  }

  /* -----------------------------
     Modal Show/Close
  ------------------------------*/
  function showModal(templateId) {
    const templateEL = document.getElementById(templateId);
    if (!templateEL) return;

    innerContent.innerHTML = ""; // clear previous
    innerContent.appendChild(templateEL.content.cloneNode(true)); // inject DOM

    modal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    findingGift();
    console.log("🎁 Gift Array at modal open:");
    // init UI + variant handling for the injected modal
    initCustomSelects(innerContent);
    initVariantHandlers(innerContent);
  }

  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  /* -----------------------------
     Events
  ------------------------------*/
  hotspots.forEach((btn) => {
    btn.addEventListener("click", () => showModal(btn.dataset.target));
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  // init selects on root load (not modal)
  initCustomSelects(root);
});
