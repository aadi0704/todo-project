// Select the theme toggle link/button
const themeToggle = document.getElementById("themeToggle");

// On page load — check saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌞 Light Mode";
} else {
    themeToggle.textContent = "🌙 Dark Mode";
}

// Toggle theme on click
themeToggle.addEventListener("click", (e) => {
    e.preventDefault();

    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    // Update text based on mode
    themeToggle.textContent = isDark ? "🌞 Light Mode" : "🌙 Dark Mode";

    // Save theme preference
    localStorage.setItem("theme", isDark ? "dark" : "light");
});
