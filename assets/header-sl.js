document.addEventListener("DOMContentLoaded", () => {
  //  Declaring Variables
  const toggleBtn = document.querySelector("#menu-toggle");
  const menuIcon = document.querySelector("#menu-icon");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuBar = document.querySelector(".menu-bar");
  // get from Liquid
  const ICONS = window.menuIcons;

  let isOpen = false;
  menuIcon.src = ICONS.close;
  mobileMenu.classList.remove("open");
  menuBar.classList.remove("menu-bar-shadow");

  //   Toggle Function
  const toggleMenu = () => {
    isOpen = !isOpen;
    menuIcon.src = isOpen ? ICONS.open : ICONS.close;
    menuIcon.classList.toggle("icon-close", isOpen);
    menuBar.classList.toggle("menu-bar-shadow", isOpen);
    mobileMenu.classList.toggle("open", isOpen);
  };

  toggleBtn.addEventListener("click", toggleMenu);
});
