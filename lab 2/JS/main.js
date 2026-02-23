const app = document.createElement("main");
app.className = "app";
document.body.append(app);

const heading = document.createElement("h1");
heading.textContent = "ToDo list";

const form = document.createElement("form");

const inputTitle = document.createElement("input");
inputTitle.type = "text";
inputTitle.placeholder = "Название задачи";

const inputDate = document.createElement("input");
inputDate.type = "date";

const addBtn = document.createElement("button");
addBtn.textContent = "Добавить";

form.append(inputTitle, inputDate, addBtn);
app.append(heading, form);