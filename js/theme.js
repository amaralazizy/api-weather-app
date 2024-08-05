export function toggleTheme() {
  document.documentElement.className = /^dark/i.test(
    document.documentElement.className
  )
    ? (document.documentElement.className = "light")
    : (document.documentElement.className = "dark");
  updateThemeIcon();
}

export function updateThemeIcon() {
  const sunIcon = document.querySelector(".theme-icon.sun");
  const moonIcon = document.querySelector(".theme-icon.moon");

  sunIcon.classList.toggle("active");
  moonIcon.classList.toggle("active");
}

export function setTheme() {
  const sunIcon = document.querySelector(".theme-icon.sun");
  const moonIcon = document.querySelector(".theme-icon.moon");
  const preferredTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark";
  document.documentElement.className = preferredTheme;
  if (preferredTheme === "light") sunIcon.classList.add("active");
  else moonIcon.classList.add("active");
}
