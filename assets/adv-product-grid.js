document.querySelectorAll(".advance-product-grid").forEach((root) => {
  document.addEventListener("click", function (e) {
    console.clear();

    // Show the clicked element
    console.log("Clicked element:", e.target);
    console.log("Tag:", e.target.tagName);
    console.log("Classes:", e.target.className);
    console.log("ID:", e.target.id);
    console.log(
      "Outer HTML (truncated):",
      e.target.outerHTML.slice(0, 200) + "..."
    );

    // Show parent chain nicely
    console.log("----- Path -----");
    e.composedPath().forEach((el) => {
      if (el.tagName) {
        console.log(el.tagName, el.className || "");
      }
    });

    // Highlight element visually for 1s
    e.target.style.outline = "2px solid red";
    setTimeout(() => {
      e.target.style.outline = "";
    }, 1000);
  });

  document.querySelectorAll(".custom-select-wrapper").forEach((wrapper) => {
    const trigger = document.querySelector(".custom-select-trigger");
    const triggerText = trigger.querySelector("span");
    const arrow = trigger.querySelector(".arrow");
    const optionBox = wrapper.querySelector(".custom-options");
    const options = wrapper.querySelectorAll(".custom-option");
    const hiddenInput = wrapper.querySelector(".hidden-input-sl");

    trigger.addEventListener("click", () => {
      e.stopPropagation();

      optionBox.classList.toggle("open");
    });

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        triggerText.textContent = option.textContent;
        hiddenInput.value = option.dataset.value;

        wrapper.classList.remove("open");
        hiddenInput.dispatchEvent(new Event("change")); // for Shopify variant JS
      });
    });
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    document
      .querySelectorAll(".custom-select-wrapper.open")
      .forEach((openSelect) => {
        if (!openSelect.contains(e.target)) {
          openSelect.classList.remove("open");
        }
      });
  });
  const hotspots = root.querySelectorAll(".hotspot-btn");
  const modal = root.querySelector(".popup-modal-sl");
  const overlay = root.querySelector(".popup-overlay-sl");
  const closeBtn = root.querySelector(".popup-modal-sl .close-btn");
  const innerContent = modal.querySelector(".popup-content ");

  function showModal(html) {
    modal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    innerContent.innerHTML = html;
  }
  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  hotspots.forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateEL = document.getElementById(btn.dataset.target);
      if (templateEL) showModal(templateEL.innerHTML);
    });
  });
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
});
