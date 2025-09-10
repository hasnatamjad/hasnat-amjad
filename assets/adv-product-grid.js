document.addEventListener("DOMContentLoaded", function () {
  const hotspots = document.querySelectorAll(".hotspot-btn");
  const modal = document.querySelector(".popup-modal-sl");
  const overlay = document.querySelector(".popup-overlay-sl");
  const closeBtn = document.querySelector(".popup-modal-sl .close-btn");

  hotspots.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.style.display = "block";
      overlay.style.display = "block";
      document.body.style.overflow = "hidden"; // stop scrolling
    });
  });

  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
});
