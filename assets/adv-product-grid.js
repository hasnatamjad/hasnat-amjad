document.querySelectorAll(".advance-product-grid").forEach((root) => {
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

document.addEventListener("DOMContentLoaded", function () {});
