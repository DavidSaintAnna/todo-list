/******* CONSTANTES ***************************************************************************/
// const API_URL = "https://delpe-todo.onrender.com/";
const token = localStorage.getItem("token");

const inputText$ = document.getElementById("input-text") as HTMLInputElement;
const createItemBtn$ = document.getElementById(
  "create-item"
) as HTMLButtonElement;
const searchWord$ = document.getElementById("search-word") as HTMLButtonElement;
const listOfTodo$ = document.getElementById("content") as HTMLUListElement;
const modalContainer$ = document.getElementById("modal") as HTMLDivElement;
const cancelDelete$ = document.getElementById(
  "cancel-delete"
) as HTMLButtonElement;
const btnFilterAll$ = document.getElementById("all") as HTMLButtonElement;
const btnFilterPending$ = document.getElementById(
  "pending"
) as HTMLButtonElement;
const btnFilterDone$ = document.getElementById("done") as HTMLButtonElement;
const confirmDelete$ = document.getElementById(
  "confirm-delete"
) as HTMLButtonElement;
const errorSpan$ = document.getElementById("error-span") as HTMLSpanElement;
const userButton$ = document.querySelector(
  "[data-js='user-button']"
) as HTMLButtonElement;
const logoutButton$ = document.querySelector(
  "[data-js='logout-button']"
) as HTMLButtonElement;
const form$ = document.querySelector("form") as HTMLFormElement;

type Todo = {
  id: number;
  description: string;
  done: boolean;
};
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
  if (!userData) return;
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
errorSpan$?.parentElement?.parentElement?.appendChild(errorSpanSearch);

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

function createTodoTemplate(todo: Todo) {
  const userRole = getUserRole();
  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.setAttribute("id", todo.id.toString());
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

  let todoToDelete: HTMLElement | null = null;
  /******* MODAL E DELETE DOS TODOS***************************************************************************/

  if (userRole === "Gerente") {
    trashIcon.addEventListener("click", (event) => {
      const target = event.currentTarget as HTMLElement | null;
      if (!target) return;

      const todoElement = target.closest("li");
      if (!todoElement) return;
      todoToDelete = todoElement;
      modalContainer$.style.display = "flex";
    });

    cancelDelete$.addEventListener("click", () => {
      modalContainer$.style.display = "none";
      todoToDelete = null;
    });

    confirmDelete$.addEventListener("click", async () => {
      if (todoToDelete) {
        const todoId = todoToDelete.id;
        deleteTodo(Number(todoId));
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
      const target = event.currentTarget as HTMLElement | null;
      if (!target) return;

      const todoElement = target.closest("li");
      if (!todoElement) return;

      const iconPen = todoElement.querySelector(
        ".fa-pen"
      ) as HTMLElement | null;
      const iconCheck = todoElement.querySelector(
        ".fa-check"
      ) as HTMLElement | null;
      const todoContent = todoElement.querySelector(
        ".todo-item-content"
      ) as HTMLElement | null;

      if (!todoContent) return;

      if (iconPen) {
        iconPen.classList.remove("fa-pen");
        iconPen.classList.add("fa-check");
        todoContent.contentEditable = "true";
        todoContent.focus();
        todoContent.classList.add("editing");
      } else {
        const newValue = todoContent.textContent?.trim() || "";

        if (newValue.length >= 5 && newValue.length <= 100) {
          const todoId = Number(todoElement.id);
          updateTodoDescription(todoId, newValue);

          if (iconCheck) {
            iconCheck.classList.remove("fa-check");
            iconCheck.classList.add("fa-pen");
          }

          todoContent.contentEditable = "false";
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
    console.log("Get todos error:", (error as Error).message);
  }
}

async function createTodo(description: string) {
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
    console.log("Create todo error:", (error as Error).message);
  }
}

// Mock updateStatusTodo function
async function updateStatusTodo(todoId: number, newStatus: boolean) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos[todoIndex].done = newStatus;
      const updatedTodo = mockTodos[todoIndex];

      const todoElement = document.getElementById(todoId.toString());
      if (todoElement) {
        const statusIcon = todoElement.querySelector(
          ".fa"
        ) as HTMLElement | null;

        if (statusIcon) {
          statusIcon.classList.remove("fa-circle-check", "fa-stop-circle");
          statusIcon.classList.add(
            updatedTodo.done ? "fa-circle-check" : "fa-stop-circle"
          );
        }

        if (updatedTodo.done) {
          todoElement.classList.add("task-completed");
          showToast();
        } else {
          todoElement.classList.remove("task-completed");
        }
      }
    }
  } catch (error: any) {
    console.log("Status update error:", error?.message ?? error);
  }
}

// Mock deleteTodo function
async function deleteTodo(todoId: number) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos.splice(todoIndex, 1);
      const todoElement = document.getElementById(todoId.toString());
      if (todoElement) {
        todoElement.remove();
      }
    }
  } catch (error) {
    console.log("Delete todo error:", (error as Error).message);
  }
}

// Mock updateTodoDescription function
async function updateTodoDescription(todoId: number, newDescription: string) {
  try {
    await mockDelay();

    const todoIndex = mockTodos.findIndex((todo) => todo.id == todoId);
    if (todoIndex !== -1) {
      mockTodos[todoIndex].description = newDescription;
    }
  } catch (error) {
    console.log("Update description error:", (error as Error).message);
  }
}

function createTodosinView(todos: Todo[]) {
  listOfTodo$.innerHTML = "";
  todos.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
}

// /******* FUNÇÃO PARA FILTRAR TODOS (PELO STATUS)***********************************************************/

let activeFilterBtn = btnFilterAll$;
let btnFilterValue = "all";

function toggleFilterButton(clickedBtn: HTMLButtonElement) {
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
  const toast = document.querySelector(".toast") as HTMLElement | null;
  if (!toast) return;

  toast.classList.add("show-toast");

  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 2000);
}

getTodos();
checkUserPermissions();
