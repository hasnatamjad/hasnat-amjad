document.querySelectorAll(".advance-product-grid").forEach((root) => {
  const modal = root.querySelector(".popup-modal-sl");
  const overlay = root.querySelector(".popup-overlay-sl");
  const closeBtn = root.querySelector(".popup-modal-sl .close-btn");
  const innerContent = modal.querySelector(".popup-content");
  const hotspots = root.querySelectorAll(".hotspot-btn");

  let giftVariant = null;

  // FINDING GIFT FROM THE GIFT PRODUCT
  function findingGift() {
    giftVariant = null;
    const giftScript = document.getElementById("gift-sl");
    if (!giftScript) return;

    let giftData;
    try {
      giftData = JSON.parse(giftScript.textContent);
    } catch {
      return;
    }

    if (!giftData || !Array.isArray(giftData.variants)) return;

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

  function initCustomSelects(scope = document) {
    scope.querySelectorAll(".custom-select-wrapper").forEach((wrapper) => {
      const defaultOption = wrapper.querySelector(".default-option-text");
      const trigger = wrapper.querySelector(".custom-select-trigger");
      if (!trigger) return;

      const triggerText = trigger.querySelector(".trigger-label");
      const options = wrapper.querySelectorAll(".custom-option");
      const hiddenInput = wrapper.querySelector(".hidden-input-select");

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (defaultOption) triggerText.textContent = defaultOption.textContent;
        wrapper.classList.toggle("open");
      });

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

  // CLOSING THE SELECT DROPDOWN WHEN CLICKED ANYWHERE
  document.addEventListener("click", (e) => {
    document
      .querySelectorAll(".custom-select-wrapper.open")
      .forEach((openSelect) => {
        if (!openSelect.contains(e.target)) {
          openSelect.classList.remove("open");
        }
      });
  });

  // VARIANTS HANDLING
  function initVariantHandlers(scope) {
    const jsonEl = scope.querySelector(".adv-grid-json");
    if (!jsonEl) return;

    let productData;
    try {
      productData = JSON.parse(jsonEl.textContent);
    } catch {
      return;
    }

    if (!productData || !Array.isArray(productData.variants)) return;

    const form = scope.querySelector(".adv-modal-form");
    if (!form) return;

    const hiddenIdInput = form.querySelector("input[name='id']");
    if (!hiddenIdInput) return;

    let selectedObj = null;

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

      const missing = optNames.some((optName) => !selectedMap[optName]);
      if (missing) {
        hiddenIdInput.value = "";
        selectedObj = null;
        return;
      }

      const matched = productData.variants.find((v) => {
        return optNames.every((optName, idx) => {
          const selectedValue = selectedMap[optName];
          const variantValue = v["option" + (idx + 1)] || "";
          return String(selectedValue) === String(variantValue);
        });
      });

      if (matched) {
        hiddenIdInput.value = matched.id;
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
      }
    }

    form
      .querySelectorAll(".hidden-input-select, .hidden-input-pill")
      .forEach((input) => {
        input.addEventListener("change", updateVariant);
      });

    scope.querySelectorAll(".adv-grid-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pillWrapper = btn.closest(".color-pills-box");
        if (!pillWrapper) return;

        const hiddenInput = pillWrapper.querySelector(".hidden-input-pill");
        if (!hiddenInput) return;

        pillWrapper
          .querySelectorAll(".adv-grid-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        hiddenInput.value = btn.dataset.value || "";
        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      updateVariant();

      const mainVariantId = hiddenIdInput.value
        ? Number(hiddenIdInput.value)
        : null;
      if (!mainVariantId) {
        alert("Please select product options before adding to cart.");
        return;
      }

      const items = [{ id: mainVariantId, quantity: 1 }];

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
        window.location.href = "/cart";
      } catch (err) {
        alert("Failed to add to cart. See console for details.");
      }
    });
  }

  // SHOWING MODAL AND INITIATING CRITICAL FUNCTIONS
  function showModal(templateId) {
    const templateEL = document.getElementById(templateId);
    if (!templateEL) return;

    innerContent.innerHTML = "";
    innerContent.appendChild(templateEL.content.cloneNode(true));

    modal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    findingGift();
    initCustomSelects(innerContent);
    initVariantHandlers(innerContent);
  }

  // CLOSING MODAL
  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  // EACH HOTSPOT OPENING MODAL
  hotspots.forEach((btn) => {
    btn.addEventListener("click", () => showModal(btn.dataset.target));
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  initCustomSelects(root);
});
