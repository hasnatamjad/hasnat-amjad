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
      if (!trigger) return; // safety

      const triggerText = trigger.querySelector(".trigger-label");
      const optionBox = wrapper.querySelector(".custom-options");
      const options = wrapper.querySelectorAll(".custom-option");

      const hiddenInput = wrapper.querySelector(".hidden-input-sl");

      // toggle dropdown
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerText.textContent = defaultOption.textContent;
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
     Modal Show/Close Functions
  ------------------------------*/
  function showModal(html) {
    modal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    innerContent.innerHTML = html;

    initCustomSelects(innerContent);
  }

  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  /* -----------------------------
     Event Listeners
  ------------------------------*/
  hotspots.forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateEL = document.getElementById(btn.dataset.target);
      if (templateEL) {
        showModal(templateEL.innerHTML);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  /* -----------------------------
     Init selects on page load too
  ------------------------------*/
  initCustomSelects(root);
});
