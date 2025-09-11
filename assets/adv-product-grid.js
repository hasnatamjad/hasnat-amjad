document.querySelectorAll(".advance-product-grid").forEach((root) => {
  const modal = root.querySelector(".popup-modal-sl");
  const overlay = root.querySelector(".popup-overlay-sl");
  const closeBtn = root.querySelector(".popup-modal-sl .close-btn");
  const innerContent = modal.querySelector(".popup-content");
  const hotspots = root.querySelectorAll(".hotspot-btn");

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
        // reset to default text each time dropdown is opened
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
          hiddenInput.value = option.dataset.value;

          wrapper.classList.remove("open");
          hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
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
     Variant Handlers
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

    // collect all inputs (selects + pills)
    const optionInputs = form.querySelectorAll(
      ".hidden-input-select, .hidden-input-pill"
    );

    function updateVariant() {
      const selectedOptions = Array.from(optionInputs).map((el) => el.value);
      console.log("👉 Selected options so far:", selectedOptions);

      if (selectedOptions.includes("") || selectedOptions.includes(null)) {
        hiddenIdInput.value = "";
        console.warn("⚠️ Not all options selected yet");
        return;
      }

      const matched = productData.variants.find((variant) => {
        const opts = [variant.option1, variant.option2, variant.option3].filter(
          Boolean
        );
        return selectedOptions.every((val, i) => val === opts[i]);
      });

      if (matched) {
        hiddenIdInput.value = matched.id;
        console.log("✅ Variant matched:", matched);
      } else {
        hiddenIdInput.value = "";
        console.warn("⚠️ No matching variant for:", selectedOptions);
      }
    }

    // listen for changes from hidden inputs
    optionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        console.log(`🎯 Option [${input.name}] changed -> ${input.value}`);
        updateVariant();
      });
    });

    // pill click handling
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

        // Set hidden input
        hiddenInput.value = btn.dataset.value;

        console.log(
          `🎨 Pill [${btn.dataset.option}] clicked -> ${btn.dataset.value}`
        );

        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  /* -----------------------------
     Modal Show/Close
  ------------------------------*/
  function showModal(templateId) {
    const templateEL = document.getElementById(templateId);
    if (!templateEL) return;

    innerContent.innerHTML = ""; // clear previous
    innerContent.appendChild(templateEL.content.cloneNode(true)); // ✅ inject DOM

    modal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";

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

  // init on root load
  initCustomSelects(root);
});

document.addEventListener("DOMContentLoaded", () => {
  const giftEl = document.getElementById("gift-sl");
  let giftData = null;

  if (giftEl) {
    try {
      giftData = JSON.parse(giftEl.textContent);
      console.log("🎁 Gift data loaded:", giftData);
    } catch (e) {
      console.error("❌ Failed to parse gift JSON:", e);
    }
  }

  // Intercept all product forms
  document.querySelectorAll(".adv-modal-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      // don’t block normal add to cart
      e.preventDefault();

      const formData = new FormData(form);
      const productVariantId = formData.get("id");

      if (!productVariantId) {
        console.warn("⚠️ No product variant selected, cannot add to cart");
        return;
      }

      // Build payload for main product
      const payload = {
        items: [{ id: productVariantId, quantity: 1 }],
      };

      // ---- Gift check logic ----
      if (giftData && Array.isArray(giftData.variants)) {
        // get selected options from form
        const selectedOptions = [];
        form
          .querySelectorAll(".hidden-input-select, .hidden-input-pill")
          .forEach((inp) => {
            selectedOptions.push((inp.value || "").toLowerCase());
          });

        console.log("🛒 Selected options (lowercased):", selectedOptions);

        // check if contains black + m
        const hasBlack = selectedOptions.some((opt) => opt === "black");
        const hasM = selectedOptions.some((opt) => opt === "m");

        if (hasBlack && hasM) {
          // find matching gift variant
          const giftVariant = giftData.variants.find((v) => {
            return (
              [v.option1, v.option2, v.option3]
                .filter(Boolean)
                .map((o) => o.toLowerCase())
                .includes("black") &&
              [v.option1, v.option2, v.option3]
                .filter(Boolean)
                .map((o) => o.toLowerCase())
                .includes("m")
            );
          });

          if (giftVariant) {
            console.log("🎁 Adding gift variant:", giftVariant);
            payload.items.push({ id: giftVariant.id, quantity: 1 });
          } else {
            console.warn("⚠️ No matching gift variant for Black + M");
          }
        }
      }

      try {
        const res = await fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Network error adding to cart");
        const data = await res.json();

        console.log("✅ Cart updated:", data);
        // Optionally redirect to cart or show mini-cart
        window.location.href = "/cart";
      } catch (err) {
        console.error("❌ Error adding to cart:", err);
      }
    });
  });
});
