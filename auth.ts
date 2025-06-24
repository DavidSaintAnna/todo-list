// const API_URL = "https://delpe-todo.onrender.com/";

const loginButton$ = document.querySelector(
  "[data-testid='login-button']"
) as HTMLButtonElement;
const emailInput$ = document.querySelector(
  "[data-testid='email']"
) as HTMLInputElement;
const passwordInput$ = document.querySelector(
  "[data-testid='password']"
) as HTMLInputElement;
const firstName$ = document.querySelector(
  "[data-testid='first-name']"
) as HTMLInputElement;
const lastName$ = document.querySelector(
  "[data-testid='last-name']"
) as HTMLInputElement;
const registerButton$ = document.querySelector(
  "[data-testid='register-button']"
) as HTMLButtonElement;
const selectElement$ = document.querySelector(
  "[data-testid='role']"
) as HTMLSelectElement;
const confirmModalButton$ = document.querySelector(
  "[data-testid='confirm-button']"
) as HTMLButtonElement;
const modalContainerAuth$ = document.querySelector(
  "[data-testid='modal-container']"
) as HTMLDivElement;
const logoutButtonAuth$ = document.querySelector(
  "[data-testid='logout-button']"
) as HTMLButtonElement;
const backButton$ = document.querySelector(
  "[data-testid='back-button']"
) as HTMLButtonElement;
const errorSpanEmail$ = document.querySelector(
  "[data-testid='error-span-email']"
) as HTMLSpanElement;
const errorSpanPassword$ = document.querySelector(
  "[data-testid='error-span-password']"
) as HTMLSpanElement;

const formAuth$ = document.querySelector("form") as HTMLFormElement;

type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  lastName: string;
  accessLevel?: string;
};
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

function generateMockJWT(user: User) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: "todo-api",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10800,
      sub: user.email,
      accessLevel: user.accessLevel,
    })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

function mockDelayAuth(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

formAuth$.addEventListener("submit", (event) => {
  event.preventDefault();
});

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.href.includes("register.html")) {
    checkTokenAuthenticationAuth();
    checkUserAccess();
  }
});

if (backButton$) {
  backButton$.addEventListener("click", () => {
    window.location.href = "todo.html";
  });
}

if (logoutButtonAuth$) {
  logoutButtonAuth$.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  });
}

function checkTokenAuthenticationAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }
}

function checkUserAccess() {
  const userData = localStorage.getItem("userData");
  if (!userData) return;

  const user = JSON.parse(userData);
  if (user?.accessLevel !== "Gerente") {
    window.location.href = "todo.html";
  }
}

function parseJwt(token: string) {
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
    await mockDelayAuth();

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.log("Login error:", errorMessage);
    alert("Login error: " + errorMessage);
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
    await mockDelayAuth();

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
    modalContainerAuth$.classList.add("show-modal");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.log("Registration error:", errorMessage);
    alert("Registration failed: " + errorMessage);
  } finally {
    registerButton$.disabled = false;
  }
}

if (confirmModalButton$)
  confirmModalButton$.addEventListener("click", () => {
    modalContainerAuth$.classList.remove("show-modal");
    window.location.href = "index.html";
  });

function validateUserInfo(email: string, password: string): boolean {
  if (email === "") {
    errorSpanEmail$.textContent = "Email is required.";
    errorSpanEmail$.classList.add("error-span-visible");
    return false;
  }

  if (password === "") {
    errorSpanPassword$.textContent = "Password is required.";
    errorSpanPassword$.classList.add("error-span-visible");
    return false;
  }
  errorSpanPassword$.classList.remove("error-span-visible");
  errorSpanEmail$.classList.remove("error-span-visible");
  return true;
}

if (loginButton$)
  loginButton$.addEventListener("click", () => {
    const email = emailInput$?.value?.trim();
    const password = passwordInput$?.value?.trim();

    const valid = validateUserInfo(email, password);

    if (valid) {
      login();
    }
  });

if (registerButton$) registerButton$.addEventListener("click", register);
