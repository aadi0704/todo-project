const continueBtn = document.getElementById('continueBtn');
const contentContainer = document.getElementById('contentcontainer');
const tip = document.getElementById('tip');

let inputElement; // global
let nameList = JSON.parse(localStorage.getItem("nameList")) || {name: "buddy", opencount: 0};

// Increment open count
nameList.opencount = (nameList.opencount || 0) + 1;

// Save updated open count immediately
function updatenameLocalStorage(){
    localStorage.setItem("nameList", JSON.stringify(nameList));
}
updatenameLocalStorage();
// Function to display greeting
function showGreeting() {
    contentContainer.innerHTML = ''; // clear previous content
    const greetingContainer = document.createElement("div");
    greetingContainer.innerHTML = `
        <p class="form-label">Hello <span class="logo">${nameList.name}</span>!</p>
        <p class="motivation-line">${getRandomLine()}</p>
    `;
    contentContainer.appendChild(greetingContainer);
    tip.textContent = "You can always change your name later in the 'More' section.";
}

// First-time login input
function firstLogin() {
    contentContainer.innerHTML = '';
    const label = document.createElement("p");
    label.textContent = "Hey there! What should we call you?";
    contentContainer.appendChild(label);

    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = "Enter your name.. or leave as buddy";
    contentContainer.appendChild(inputElement);

    tip.textContent = "Enter your entertainment name and click Continue to begin your journey!";
}

// Random motivational line
function getRandomLine() {
    const lines = [
        "Small progress each day adds up to big results.",
        "You don't need to be perfect - just consistent",
        "Take a deep breath - you've got this.",
        "Let's crush it today.",
        "You're doing better than you think."
    ];
    return lines[Math.floor(Math.random()*lines.length)];
}

// Decide first-time or returning
if (nameList.opencount === 1) {
    firstLogin();
} else {
    showGreeting();
}

// Continue button handler
continueBtn.addEventListener("click", () => {
    let newName = inputElement ? inputElement.value.trim() : nameList.name;
    if (!newName) newName = "buddy"; // default

    nameList.name = newName;
    localStorage.setItem("nameList", JSON.stringify(nameList));

    // Update greeting immediately
    continueBtnhref();
    updatenameLocalStorage();
    // Optional: navigate to saved page
    
});
function continueBtnhref(){
    if (localStorage.getItem("lastpage") === "notes") continueBtn.href="notes.html";
    else if (localStorage.getItem("lastpage") === "studyplan") continueBtn.href="studytracker.html";
    else continueBtn.href="todolist.html";
}
// Optional: Change name via prompt anytime
function askInput() {
    let userInput = prompt("Please enter your name:");
    if(userInput && userInput.trim() !== ""){
        nameList.name = userInput.trim();
        localStorage.setItem("nameList", JSON.stringify(nameList));
        updatenameLocalStorage();
        alert("Name changed to: " + nameList.name);
    }
}
