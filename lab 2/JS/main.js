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

//add note form -----------------------------
const form = document.createElement("form");

const inputTitle = document.createElement("input");
inputTitle.id = "text";
inputTitle.type = "text";
inputTitle.placeholder = "Название задачи";
inputTitle.required = true;

const inputDate = document.createElement("input");
inputDate.id = "date";
inputDate.type = "date";

const addBtn = document.createElement("button");
addBtn.textContent = "Добавить";

form.append(inputTitle, inputDate, addBtn);
app.append(heading, form);

// search -----------------------------------
const search = document.createElement("div");
search.className = "search";

const searchInput = document.createElement("input");
searchInput.id = "searchBar";
searchInput.placeholder = "Search...";

const filterSelect = document.createElement("select");
filterSelect.id = "filterByCompletion";
filterSelect.innerHTML = `
  <option value="all">Все</option>
  <option value="active">В работе</option>
  <option value="completed">Завершенные</option>
`;

const sortBtn = document.createElement("button");
sortBtn.type = "button";
sortBtn.textContent = "Сортировать по дедлайну";

search.append(searchInput, filterSelect, sortBtn);
app.append(search);

// add task list
const taskList = document.createElement("ul");
taskList.className = "task-list";
app.append(taskList);

// render -----------------------------
function renderTasks() {
    taskList.innerHTML = "";

    //create filtered selection
    let filtered = [...tasks];

    filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (filterSelect.value === "active") {
        filtered = filtered.filter(t => !t.completed);
    }
    if (filterSelect.value === "completed") {
        filtered = filtered.filter(t => t.completed);
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.draggable = true;
        li.dataset.id = task.id;

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        //show title and darte
        const span = document.createElement("span");
        span.textContent = `${task.title} (${task.date})`;

        //edit note
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.type = "button";

        editBtn.addEventListener("click", () => {
            const newTitle = prompt("Измениеть заголовок:", task.title);
            const newDate = prompt("Изменить дату:", task.date);

            if (newTitle) task.title = newTitle;
            if (newDate) task.date = newDate;

            saveTasks();
            renderTasks();
        });

        //delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.type = "button";

        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        //drag and drop
        li.addEventListener("dragstart", () => {
            dragStartId = task.id;
        });

        li.addEventListener("dragover", e => {
            e.preventDefault();
        });

        li.addEventListener("drop", () => {
            const dragIndex = tasks.findIndex(t => t.id === dragStartId);
            const dropIndex = tasks.findIndex(t => t.id === task.id);

            const dragged = tasks.splice(dragIndex, 1)[0];
            tasks.splice(dropIndex, 0, dragged);

            saveTasks();
            renderTasks();
        });


        li.append(checkbox, span, editBtn, deleteBtn);
        taskList.append(li);
    });
}

// even ts ---------------------------------
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

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

sortBtn.addEventListener("click", () => {
    tasks.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(a.date) - new Date(b.date);
    });
    saveTasks();
    renderTasks();
});

// init ---------------------------
loadTasks();
renderTasks();