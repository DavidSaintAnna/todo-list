const API_URL = "https://delpe-todo.onrender.com/";

const loginButton$ = document.querySelector("[data-js='login-button']");
const emailInput$ = document.querySelector("[data-js='email']");
const passwordInput$ = document.querySelector("[data-js='password']");
const firstName$ = document.querySelector("[data-js='first-name']");
const lastName$ = document.querySelector("[data-js='last-name']");
const registerButton$ = document.querySelector("[data-js='register-button']");
const selectElement$ = document.querySelector('[data-js="role"]');
const confirmModalButton$ = document.querySelector(
  "[data-js='confirm-button']"
);
const modalContainer$ = document.querySelector("[data-js='modal-container']");

const form$ = document.querySelector("form");

form$.addEventListener("submit", (event) => {
  event.preventDefault();
});

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

function getUserDetails(email) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((users) => {
      const currentUser = users.find((user) => user.email === email);
      console.log("User details:", currentUser);
      console.log("Access Level:", currentUser.accessLevel);
      localStorage.setItem("userData", JSON.stringify(currentUser));
      window.location.href = "todo.html";
    })
    .catch((error) => console.error("Error fetching user:", error));
}

function login() {
  const email = emailInput$.value;
  const password = passwordInput$.value;

  loginButton$.disabled = true;

  fetch(`${API_URL}auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((responseData) => {
      localStorage.setItem("token", responseData.token);
      const decodedToken = parseJwt(responseData.token);
      getUserDetails(decodedToken.sub);
      loginButton$.disabled = false;
    })
    .catch((error) => {
      loginButton$.disabled = false;
      console.log(error.message);
    });
}

// function register() {
//   fetch("https://delpe-todo.onrender.com/users", {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   })
//     .then((resp) => {
//       if (!resp.ok) {
//         throw new Error(`Erro ${resp.status}: ${resp.statusText}`);
//       }
//       return resp.json();
//     })
//     .then((json) => console.log("Resposta:", json))
//     .catch((error) => console.error("Erro na requisição:", error));
// }

function register() {
  const email = emailInput$.value;
  const password = passwordInput$.value;
  const name = firstName$.value;
  const lastName = lastName$.value;
  const accessLevel = selectElement$.value;
  fetch(`${API_URL}users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      email,
      password,
      name,
      lastName,
      accessLevel,
    }),
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then((json) => {
      localStorage.setItem("userData", JSON.stringify(json));
      modalContainer$.classList.add("show-modal");
    })
    .catch((error) => {
      console.log(error.message);
    });
}

if (confirmModalButton$)
  confirmModalButton$.addEventListener("click", () => {
    modalContainer$.classList.remove("show-modal");
    window.location.href = "index.html";
  });
if (loginButton$) loginButton$.addEventListener("click", login);
if (registerButton$) registerButton$.addEventListener("click", register);
