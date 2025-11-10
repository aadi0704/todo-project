
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌞 Light Mode";
} else {
    themeToggle.textContent = "🌙 Dark Mode";
}


themeToggle.addEventListener("click", (e) => {
    e.preventDefault();

    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    
    themeToggle.textContent = isDark ? "🌞 Light Mode" : "🌙 Dark Mode";

    
    localStorage.setItem("theme", isDark ? "dark" : "light");
});
