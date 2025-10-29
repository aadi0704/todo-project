document.addEventListener("DOMContentLoaded", function () {
  let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let messageElement = document.getElementById("deom-task");

localStorage.setItem("lastpage", "todolist");


function getTodoListFromLocalStorage() {
  let stringifiedTodoList = localStorage.getItem("todoList");
  let parsedTodoList = JSON.parse(stringifiedTodoList);
  if (parsedTodoList === null) {
    return [];
  } else {
    return parsedTodoList;
  }
}

let todoList = getTodoListFromLocalStorage();


function updateLocalStorage() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
  }

function onAddTodo() {
  let userInputElement = document.getElementById("todoUserInput");
  let userInputValue = userInputElement.value.trim();

  if (!userInputValue) {
    return alert("Enter Valid Text");
  }

  let newTodo = {
    text: userInputValue,
    uniqueNo: Date.now(),
    isChecked: false
  };
  todoList.push(newTodo);
  createAndAppendTodo(newTodo);
  userInputElement.value = "";
    updateLocalStorage();
    updateUI();
    updateProgressBar();
    showPopup("✅ Task added! Let's get it done!", "info");
}

addTodoButton.onclick = function() {
  onAddTodo();
};

function onTodoStatusChange(checkboxId, labelId, todoId) {
  let checkboxElement = document.getElementById(checkboxId);
  let labelElement = document.getElementById(labelId);
  labelElement.classList.toggle("checked");

  let todoObjectIndex = todoList.findIndex(function(eachTodo) {
    let eachTodoId = "todo" + eachTodo.uniqueNo;

    if (eachTodoId === todoId) {
      return true;
    } else {
      return false;
    }
  });

  let todoObject = todoList[todoObjectIndex];

  if(todoObject.isChecked === true){
    showPopup("🔄 Task marked as pending. Stay focused!", "warning");
    
    todoObject.isChecked = false;
  } else {
    showPopup("🎉 Task completed! Keep going!", "success");
    todoObject.isChecked = true;
  }
    updateUI();
    updateLocalStorage();
    updateProgressBar();
}

function onDeleteTodo(todoId) {
  let todoElement = document.getElementById(todoId);
  if (todoElement) {
    
    todoElement.style.transition = "opacity 0.3s, transform 0.3s";
    todoElement.style.opacity = 0;
    todoElement.style.transform = "translateX(-20px)";

  
    setTimeout(() => {
      if (todoElement.parentNode) {
        todoItemsContainer.removeChild(todoElement);
      }

      
      let deleteElementIndex = todoList.findIndex(function(eachTodo) {
        let eachTodoId = "todo" + eachTodo.uniqueNo;
        return eachTodoId === todoId;
      });
      if (deleteElementIndex > -1) {
        todoList.splice(deleteElementIndex, 1);
      }
    updateUI();
      updateLocalStorage();
      updateProgressBar();
      
    }, 300);
  }
  showPopup("🗑️ Task deleted. Keep moving forward!", "danger");
}


function createAndAppendTodo(todo) {
  let todoId = "todo" + todo.uniqueNo;
  let checkboxId = "checkbox" + todo.uniqueNo;
  let labelId = "label" + todo.uniqueNo;

  let todoElement = document.createElement("li");
  todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
  todoElement.id = todoId;
  todoItemsContainer.appendChild(todoElement);

  let inputElement = document.createElement("input");
  inputElement.type = "checkbox";
  inputElement.id = checkboxId;
  inputElement.checked = todo.isChecked;

  inputElement.onclick = function () {
    onTodoStatusChange(checkboxId, labelId, todoId);
  };

  inputElement.classList.add("checkbox-input");
  todoElement.appendChild(inputElement);

  let labelContainer = document.createElement("div");
  labelContainer.classList.add("label-container", "d-flex", "flex-row");
  todoElement.appendChild(labelContainer);

  let labelElement = document.createElement("label");
  labelElement.setAttribute("for", checkboxId);
  labelElement.id = labelId;
  labelElement.classList.add("checkbox-label");
  labelElement.textContent = todo.text;
  if (todo.isChecked === true) {
    labelElement.classList.add("checked");
  }
  labelContainer.appendChild(labelElement);

  let deleteIconContainer = document.createElement("div");
  deleteIconContainer.classList.add("delete-icon-container");
  labelContainer.appendChild(deleteIconContainer);

  let deleteIcon = document.createElement("i");
  deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");

  deleteIcon.onclick = function () {
    onDeleteTodo(todoId);
  };

  deleteIconContainer.appendChild(deleteIcon);
    
}

todoList.forEach(todo => createAndAppendTodo(todo));
function updateUI() {
    if (todoList.length === 0) {
      messageElement.textContent = "📝 Your task list is empty! Add tasks and complete them to stay organized.";
      messageElement.style.color = "#dc3545";
      messageElement.style.display = "block";
    } else if (todoList.every(todo => todo.isChecked)) {
      messageElement.textContent = "🎉 Congratulations! You've completed all your tasks!";
      messageElement.style.color = "#198754"; 
      messageElement.style.display = "block";
      setTimeout(()=>{
        showPopup("🏆 Congratulations! All tasks completed!", "success");
      },2000);
    } else {
      messageElement.style.display = "none";
    }
  }
    updateUI();
    function updateFooterTime() {
    const now = new Date();
    document.getElementById("footerTime").textContent = ` | ${now.toLocaleTimeString()}`;
}
setInterval(updateFooterTime, 1000);
updateFooterTime();
const tips = [
  "Stay focused and keep moving forward!",
  "Small steps every day lead to big results.",
  "Prioritize tasks, reduce stress.",
  "Consistency is key to success.",
  "Celebrate small wins to stay motivated!"
];

function showRandomTip() {
  const randomIndex = Math.floor(Math.random() * tips.length);
  const tipElement = document.getElementById("dailyTip");
  tipElement.textContent = tips[randomIndex];
}
showRandomTip();
setInterval(showRandomTip, 30000);

function updateProgressBar() {
    const totalTasks = todoList.length;
    const completedTasks = todoList.filter(todo => todo.isChecked).length;
    const remainingTasks = totalTasks - completedTasks;

    const progressBar = document.getElementById("todoProgress");
    const tasksCompletedText = document.getElementById("tasksCompleted");
    const tasksRemainingText = document.getElementById("tasksRemaining");

    let percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage);
    progressBar.textContent = `${percentage}%`;
    tasksCompletedText.textContent = `Completed: ${completedTasks}`;
    tasksRemainingText.textContent = `Remaining: ${remainingTasks}`;
    const rewardElement = document.getElementById("todoMotivate");
    if(percentage === 100 || totalTasks ==0){
        rewardElement.style.display = "none";
        return;
    }
    rewardElement.style.display = "block";
   if (percentage >= 75) {
    rewardElement.textContent = "🌟 You're doing great! Keep up the fantastic work!";
    rewardElement.style.color = "#198754"; // Green, success color
} else if (percentage >= 50) {
    rewardElement.textContent = "👍 More than halfway there! Stay motivated!";
    rewardElement.style.color = "#0dcaf0"; // Light blue, info color
} else if (percentage >= 25) {
    rewardElement.textContent = "💪 Good start! Keep pushing forward!";
    rewardElement.style.color = "#ffc107"; // Yellow, warning color
} else {
    rewardElement.textContent = "🚀 Let's get started! You can do it!";
    rewardElement.style.color = "#dc3545"; // Red, danger color
}

}
function showPopup(message, type = "info") {
    const popup = document.createElement("div");
    popup.className = `todo-popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("hide");
        setTimeout(() => popup.remove(), 500);
    }, 3000); // display for 3 seconds
}

updateProgressBar();
});
