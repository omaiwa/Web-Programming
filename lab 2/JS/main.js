let tasks = [];
let dragStartId = null;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const data = localStorage.getItem("tasks");
    tasks = data ? JSON.parse(data) : [];
}

//layout ---------------------------
const app = document.createElement("main");
app.className = "app";
document.body.append(app);

//heading
const heading = document.createElement("h1");
heading.textContent = "ToDo list";

//add note
const form = document.createElement("form");

const inputTitle = document.createElement("input");
inputTitle.type = "text";
inputTitle.placeholder = "Название задачи";
inputTitle.requred = true;

const inputDate = document.createElement("input");
inputDate.type = "date";

const addBtn = document.createElement("button");
addBtn.textContent = "Добавить";

form.append(inputTitle, inputDate, addBtn);
app.append(heading, form);

// add task list
const taskList = document.createElement("ul");
taskList.className = "task-list";
app.append(taskList);

// render -----------------------------
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = `${task.title} (${task.date})`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.type = "button";

        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, span, deleteBtn);
        taskList.append(li);
    });
}

// add new task ---------------------------------
form.addEventListener("submit", e => {
    e.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        title: inputTitle.value,
        date: inputDate.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    form.reset();
});

// init ---------------------------
loadTasks();
renderTasks();