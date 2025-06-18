/******* CONSTANTES ***************************************************************************/
const API_URL = "https://delpe-todo.onrender.com/";
const token = localStorage.getItem("token");

const inputText$ = document.getElementById("input-text");
const createItemBtn$ = document.getElementById("create-item");
const searchWord$ = document.getElementById("search-word");
const listOfTodo$ = document.getElementById("content");
const modalContainer$ = document.getElementById("modal");
const cancelDelete$ = document.getElementById("cancel-delete");
const btnFilterAll$ = document.getElementById("all");
const btnFilterPending$ = document.getElementById("pending");
const btnFilterDone$ = document.getElementById("done");
const confirmDelete$ = document.getElementById("confirm-delete");
const errorSpan$ = document.getElementById("error-span");
const userButton$ = document.querySelector("[data-js='user-button']");
const logoutButton$ = document.querySelector("[data-js='logout-button']");
const form$ = document.querySelector("form");

let mockTodos = [
  { id: 1, description: "preciso estudar mais", done: false },
  { id: 2, description: "preciso parar de perder tempo", done: true },
  { id: 3, description: "ficarei sozinho", done: false },
  { id: 4, description: "preciso de dinheiro", done: false },
  { id: 5, description: "preciso ter fé", done: true },
];

let nextTodoId = 6;

// Mock API delay
function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkTokenAuthentication() {
  if (!token) {
    window.location.href = "index.html";
    return;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.href.includes("todo.html")) {
    checkTokenAuthentication();
  }
});

function getUserRole() {
  const userData = localStorage.getItem("userData");
  const user = JSON.parse(userData);
  return user.accessLevel;
}

function checkUserPermissions() {
  const userRole = getUserRole();
  if (userRole === "Gerente") {
    userButton$.classList.remove("hide");
  }
  if (userRole === "Cliente" || userRole === "Dev") {
    inputText$.disabled = true;
    inputText$.classList.add("not-allowed");
    createItemBtn$.disabled = true;
  }
}

logoutButton$.addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  window.location.href = "index.html";
});

userButton$.addEventListener("click", () => {
  window.location.href = "register.html";
});

form$.addEventListener("submit", (event) => {
  event.preventDefault();
});

errorSpan$.classList.add("error-span");

const errorSpanSearch = document.createElement("span");
errorSpanSearch.classList.add("error-span-content");
errorSpan$.parentElement.parentElement.appendChild(errorSpanSearch);

/******* FUNÇÃO PARA HABILITAR CRIAÇÃO DO tODO ********************************************************************/
inputText$.addEventListener("input", () => {
  const value = inputText$.value.trim();
  createItemBtn$.disabled = value.length < 5 || value.length > 100;
  searchWord$.disabled = mockTodos.length === 0;

  if (value.length < 5) {
    errorSpan$.textContent = "this field must have at least 5 characters!";
    errorSpan$.classList.add("error-span-visible");
  } else if (value.length > 100) {
    errorSpan$.textContent = "limit of characters reached!";
    errorSpan$.classList.add("error-span-visible");
    createItemBtn$.disabled = true;
  } else {
    errorSpan$.classList.remove("error-span-visible");
  }
});

inputText$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const value = inputText$.value.trim();
    if (value.length >= 5) {
      createItemBtn$.click();
    }
  }
});

/******* FUNÇÃO PARA CRIAR OS TODOS INICIO ***************************************************************************/

createItemBtn$.addEventListener("click", () => {
  const userRole = getUserRole();

  if (userRole !== "Gerente") {
    return;
  }

  const value = inputText$.value.trim();
  if (value.length < 5 || value.length > 100) return;
  createTodo(value);
  inputText$.value = "";
  createItemBtn$.disabled = true;
});

function createTodoTemplate(todo) {
  const userRole = getUserRole();
  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.setAttribute("id", todo.id);
  if (todo.done) {
    li.classList.add("task-completed");
  }

  const divGroup = document.createElement("div");
  divGroup.classList.add("todo-item-group");

  const statusIcon = document.createElement("i");
  statusIcon.classList.add(
    "fa",
    todo.done ? "fa-circle-check" : "fa-stop-circle"
  );
  statusIcon.style.cursor = "pointer";

  const idText = document.createElement("span");
  idText.textContent = `#${todo.id}`;

  const spanDescription = document.createElement("span");
  spanDescription.classList.add("todo-item-content");
  spanDescription.appendChild(document.createTextNode(todo.description));

  const divItems = document.createElement("div");
  const penIcon = document.createElement("i");
  penIcon.classList.add("fa-solid", "fa-pen");
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash");

  divGroup.appendChild(statusIcon);
  divGroup.appendChild(idText);
  divGroup.appendChild(spanDescription);
  divItems.appendChild(penIcon);
  divItems.appendChild(trashIcon);
  li.appendChild(divGroup);
  li.appendChild(divItems);

  if (userRole === "Cliente") {
    statusIcon.classList.add("not-allowed");
  } else {
    statusIcon.style.cursor = "pointer";
    statusIcon.addEventListener("click", () => {
      const newCheckedState = !todo.done;
      updateStatusTodo(todo.id, newCheckedState);
    });
  }

  let todoToDelete = null;

  /******* MODAL E DELETE DOS TODOS***************************************************************************/

  if (userRole === "Gerente") {
    trashIcon.addEventListener("click", (event) => {
      todoToDelete = event.target.parentElement.parentElement;
      modalContainer$.style.display = "flex";
    });

    cancelDelete$.addEventListener("click", () => {
      modalContainer$.style.display = "none";
      todoToDelete = null;
    });

    confirmDelete$.addEventListener("click", async () => {
      if (todoToDelete) {
        const todoId = todoToDelete.id;
        deleteTodo(todoId);
        modalContainer$.style.display = "none";
        todoToDelete = null;
      }
    });

    modalContainer$.addEventListener("click", (event) => {
      if (event.target === modalContainer$) {
        modalContainer$.style.display = "none";
        todoToDelete = null;
      }
    });

    //icone edição
    penIcon.addEventListener("click", (event) => {
      const todoElement = event.target.parentElement.parentElement;
      const iconPen = todoElement.querySelector(".fa-pen");
      const iconCheck = todoElement.querySelector(".fa-check");
      const todoContent = todoElement.querySelector(".todo-item-content");
      if (iconPen) {
        iconPen.classList.remove("fa-pen");
        iconPen.classList.add("fa-check");
        todoContent.contentEditable = true;
        todoContent.focus();
        todoContent.classList.add("editing");
      } else {
        const newValue = todoContent.textContent.trim();
        if (newValue.length >= 5 && newValue.length <= 100) {
          const todoId = todoElement.id;
          updateTodoDescription(todoId, newValue);
          iconCheck.classList.remove("fa-check");
          iconCheck.classList.add("fa-pen");
          todoContent.contentEditable = false;
          todoContent.classList.remove("editing");
        } else if (newValue.length < 5) {
          alert("Todo must be at least 5 characters long!");
          todoContent.focus();
        } else {
          alert("Todo cannot exceed 100 characters!");
          todoContent.focus();
        }
      }
    });
  } else {
    trashIcon.classList.add("not-allowed");
    penIcon.classList.add("not-allowed");
  }
  return li;
}

async function getTodos() {
  try {
    await mockDelay();
    console.log("Mock API Response:", mockTodos);
    createTodosinView(mockTodos);
  } catch (error) {
    console.log("Get todos error:", error.message);
  }
}

async function createTodo(description) {
  try {
    await mockDelay();

    const newTodo = {
      id: nextTodoId++,
      description: description,
      done: false,
    };

    mockTodos.push(newTodo);
    getTodos(); // Refresh the view
  } catch (error) {
    console.log("Create todo error:", error.message);
  }
}

// Mock updateStatusTodo function
async function updateStatusTodo(todoId, newStatus) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos[todoIndex].done = newStatus;
      const updatedTodo = mockTodos[todoIndex];

      const todoElement = document.getElementById(todoId);
      if (todoElement) {
        const statusIcon = todoElement.querySelector(".fa");
        statusIcon.classList.remove("fa-circle-check", "fa-stop-circle");
        statusIcon.classList.add(
          updatedTodo.done ? "fa-circle-check" : "fa-stop-circle"
        );
        if (updatedTodo.done) {
          todoElement.classList.add("task-completed");
          showToast();
        } else {
          todoElement.classList.remove("task-completed");
        }
      }
    }
  } catch (error) {
    console.log("Status update error:", error.message);
  }
}

// Mock deleteTodo function
async function deleteTodo(todoId) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos.splice(todoIndex, 1);
      const todoElement = document.getElementById(todoId);
      if (todoElement) {
        todoElement.remove();
      }
    }
  } catch (error) {
    console.log("Delete todo error:", error.message);
  }
}

// Mock updateTodoDescription function
async function updateTodoDescription(todoId, newDescription) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos[todoIndex].description = newDescription;
    }
  } catch (error) {
    console.log("Update description error:", error.message);
  }
}

function createTodosinView(todos) {
  listOfTodo$.innerHTML = "";
  todos.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
}

// /******* FUNÇÃO PARA FILTRAR TODOS (PELO STATUS)***********************************************************/

let activeFilterBtn = btnFilterAll$;
let btnFilterValue = "all";

function toggleFilterButton(clickedBtn) {
  activeFilterBtn.classList.remove("btn-filter-active");
  clickedBtn.classList.add("btn-filter-active");
  activeFilterBtn = clickedBtn;
}

function applyFilters() {
  const searchValue = inputText$.value.trim().toLowerCase();
  let filteredTodos = mockTodos;

  filteredTodos = filteredTodos.filter((todo) =>
    todo.description.toLowerCase().includes(searchValue)
  );

  if (btnFilterValue === "done") {
    filteredTodos = filteredTodos.filter((todo) => todo.done === true);
  } else if (btnFilterValue === "pending") {
    filteredTodos = filteredTodos.filter((todo) => todo.done === false);
  }

  listOfTodo$.innerHTML = "";
  createTodosinView(filteredTodos);

  if (filteredTodos.length === 0) {
    errorSpanSearch.textContent = "No todos found!";
    errorSpanSearch.classList.add("error-span-visible");
  } else {
    errorSpanSearch.classList.remove("error-span-visible");
  }
}

searchWord$.addEventListener("click", applyFilters);

btnFilterAll$.addEventListener("click", () => {
  btnFilterValue = "all";
  toggleFilterButton(btnFilterAll$);
  getTodos();
});

btnFilterPending$.addEventListener("click", () => {
  btnFilterValue = "pending";
  toggleFilterButton(btnFilterPending$);
  applyFilters();
});

btnFilterDone$.addEventListener("click", () => {
  btnFilterValue = "done";
  toggleFilterButton(btnFilterDone$);
  applyFilters();
});

function showToast() {
  const toast = document.querySelector(".toast");
  toast.classList.add("show-toast");
  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 2000);
}

getTodos();
checkUserPermissions();
