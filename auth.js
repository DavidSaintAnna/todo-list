const API_URL = "https://delpe-todo.onrender.com/";

const loginButton$ = document.querySelector("[data-testid='login-button']");
const emailInput$ = document.querySelector("[data-testid='email']");
const passwordInput$ = document.querySelector("[data-testid='password']");
const firstName$ = document.querySelector("[data-testid='first-name']");
const lastName$ = document.querySelector("[data-testid='last-name']");
const registerButton$ = document.querySelector(
  "[data-testid='register-button']"
);
const selectElement$ = document.querySelector("[data-testid='role']");
const confirmModalButton$ = document.querySelector(
  "[data-testid='confirm-button']"
);
const modalContainer$ = document.querySelector(
  "[data-testid='modal-container']"
);
const logoutButton$ = document.querySelector("[data-testid='logout-button']");
const backButton$ = document.querySelector("[data-testid='back-button']");
const errorSpanEmail$ = document.querySelector(
  "[data-testid='error-span-email']"
);
const errorSpanPassword$ = document.querySelector(
  "[data-testid='error-span-password']"
);

const form$ = document.querySelector("form");

const mockUsers = [
  {
    id: 1,
    email: "manager@mail.com",
    password: "dmaloc",
    name: "Manager",
    lastName: "User",
    accessLevel: "Gerente",
  },
  {
    id: 2,
    email: "dev@mail.com",
    password: "password",
    name: "Developer",
    lastName: "User",
    accessLevel: "Dev",
  },
  {
    id: 3,
    email: "client@mail.com",
    password: "password",
    name: "Client",
    lastName: "User",
    accessLevel: "Cliente",
  },
];

function generateMockJWT(user) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: "todo-api",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10800, // 3 hours
      sub: user.email,
      accessLevel: user.accessLevel,
    })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

function mockDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

form$.addEventListener("submit", (event) => {
  event.preventDefault();
});

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.href.includes("register.html")) {
    checkTokenAuthentication();
    checkUserAccess();
  }
});

if (backButton$) {
  backButton$.addEventListener("click", () => {
    window.location.href = "todo.html";
  });
}

if (logoutButton$) {
  logoutButton$.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  });
}

function checkTokenAuthentication() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }
}

function checkUserAccess() {
  const userData = localStorage.getItem("userData");
  const user = JSON.parse(userData);
  if (user.accessLevel !== "Gerente") {
    window.location.href = "todo.html";
    return;
  }
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}

async function login() {
  const email = emailInput$.value;
  const password = passwordInput$.value;

  loginButton$.disabled = true;

  try {
    await mockDelay();

    const user = mockUsers.find(
      (element) => element.email === email && element.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = generateMockJWT(user);

    const responseData = { token };

    localStorage.setItem("token", responseData.token);
    const decodedToken = parseJwt(responseData.token);

    const userData = {
      accessLevel: decodedToken.accessLevel,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    window.location.href = "todo.html";
  } catch (error) {
    console.log("Login error:", error.message);
    alert("Login failed: " + error.message);
  } finally {
    loginButton$.disabled = false;
  }
}

async function register() {
  const email = emailInput$.value;
  const password = passwordInput$.value;
  const name = firstName$.value;
  const lastName = lastName$.value;
  const accessLevel = selectElement$.value;

  registerButton$.disabled = true;

  try {
    await mockDelay();

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: mockUsers.length + 1,
      email,
      password,
      name,
      lastName,
      accessLevel,
    };

    mockUsers.push(newUser);

    localStorage.setItem("userData", JSON.stringify(newUser));
    modalContainer$.classList.add("show-modal");
  } catch (error) {
    console.log("Registration error:", error.message);
    alert("Registration failed: " + error.message);
  } finally {
    registerButton$.disabled = false;
  }
}

if (confirmModalButton$)
  confirmModalButton$.addEventListener("click", () => {
    modalContainer$.classList.remove("show-modal");
    window.location.href = "index.html";
  });

function checkLoginIsValid() {
  const email = emailInput$?.value?.trim();
  const password = passwordInput$?.value?.trim();

  const errorClassName = "error-span-visible";

  errorSpanEmail$.classList.remove(errorClassName);
  errorSpanPassword$.classList.remove(errorClassName);

  if (!email && !password) {
    errorSpanEmail$.textContent = "Email is required.";
    errorSpanEmail$.classList.add(errorClassName);
    errorSpanPassword$.textContent = "Password is required.";
    errorSpanPassword$.classList.add(errorClassName);
    return false;
  }
  if (!email) {
    errorSpanEmail$.textContent = "Email is required.";
    errorSpanEmail$.classList.add(errorClassName);
    return false;
  }

  if (!password) {
    errorSpanPassword$.textContent = "Password is required.";
    errorSpanPassword$.classList.add(errorClassName);
    return false;
  }

  return true;
}

if (loginButton$)
  loginButton$.addEventListener("click", () => {
    if (!checkLoginIsValid()) return;
    login();
  });

if (registerButton$) registerButton$.addEventListener("click", register);
