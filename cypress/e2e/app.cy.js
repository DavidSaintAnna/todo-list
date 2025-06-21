describe("login page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });

  it("should show validation errors when login button is clicked with empty fields", () => {
    cy.get("[data-testid='login-button']").click();

    cy.get("[data-testid='error-span-email']")
      .should("be.visible")
      .and("contain.text", "Email is required.");

    cy.get("[data-testid='error-span-password']")
      .should("be.visible")
      .and("contain.text", "Password is required.");
  });
  it("should show alert with invalid credentials when user does not exist", () => {
    cy.get("[data-testid='email']").type("invalid@mail.com");
    cy.get("[data-testid='password']").type("tupatupatupa");

    cy.window().then((win) => {
      cy.stub(win, "alert").as("windowAlert");
    });

    cy.get("[data-testid='login-button']").click();

    cy.get("@windowAlert").should(
      "have.been.calledWith",
      "Login failed: Invalid credentials"
    );
    cy.url().should("include", "localhost:5173");
  });
  it("should hide error spans when valid input is entered after showing errors", () => {
    cy.get("[data-testid='login-button']").click();
    cy.get("[data-testid='error-span-email']").should(
      "have.class",
      "error-span-visible"
    );
    cy.get("[data-testid='error-span-password']").should(
      "have.class",
      "error-span-visible"
    );
    cy.get("[data-testid='email']").type("manager@mail.com");
    cy.get("[data-testid='login-button']").click();
    cy.get("[data-testid='error-span-email']").should(
      "not.have.class",
      "error-span-visible"
    );
    cy.get("[data-testid='error-span-password']").should(
      "have.class",
      "error-span-visible"
    );
    cy.get("[data-testid='password']").type("dmaloc");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
  });
  it("should successfully login with valid manager credentials", () => {
    cy.get("[data-testid='email']").type("manager@mail.com");
    cy.get("[data-testid='password']").type("dmaloc");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
  });
});
describe("Gerente access level", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-testid='email']").type("manager@mail.com");
    cy.get("[data-testid='password']").type("dmaloc");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
  });

  it("should show user creation button for manager", () => {
    cy.get('[data-js="user-button"]').should("be.visible");
    cy.get('[data-js="user-button"]').should("not.have.class", "hide");
  });

  it("should allow task creation", () => {
    cy.get("#input-text").should("not.be.disabled");
    cy.get("#input-text").should("not.have.class", "not-allowed");

    cy.get("#input-text").type("Test task for manager");
    cy.get("#create-item").should("not.be.disabled").click();
    cy.get(".todo-item").should("contain", "Test task for manager");
  });
  it("should allow task status changes", () => {
    cy.get(".todo-item").first().find(".fa").click();
    cy.get(".todo-item").first().should("have.class", "task-completed");
  });
  it("should allow task editing", () => {
    cy.get(".todo-item").first().find(".fa-pen").click();
    cy.get(".todo-item")
      .first()
      .find(".todo-item-content")
      .clear()
      .type("Edited task content");
    cy.get(".todo-item").first().find(".fa-check").click();

    cy.get(".todo-item").first().should("contain", "Edited task content");
  });
  it("should allow task deletion", () => {
    cy.get("#input-text").type("Task to delete");
    cy.get("#create-item").click();
    cy.get(".todo-item").first().find(".fa-trash").click();
    cy.get("#modal").should("be.visible");
    cy.get("#confirm-delete").click();
    cy.get(".todo-item").should("not.contain", "Task to delete");
  });

  it("should navigate to user registration page", () => {
    cy.get('[data-js="user-button"]').click();
    cy.url().should("include", "register.html");
    cy.get('[data-testid="first-name"]').type("João");
    cy.get('[data-testid="last-name"]').type("Silva");
    cy.get('[data-testid="email"]').type("joao.silva@example.com");
    cy.get('[data-testid="password"]').type("password123");
    cy.get('[data-testid="role"]').select("DEV");
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="modal-container"]').should(
      "have.class",
      "show-modal"
    );
    cy.get(".modal h2").should("contain", "Success");
    cy.get(".modal p").should(
      "contain",
      "You have sucessfully created a user!"
    );
    cy.get('[data-testid="confirm-button"]').click();
    cy.url().should("include", "index.html");
  });
  it("should navigate back to home page when back button is clicked", () => {
    cy.get('[data-js="user-button"]').click();
    cy.url().should("include", "register.html");
    cy.get('[data-testid="back-button"]').click();
    cy.url().should("include", "todo.html");
  });
  it("should filter tasks by status", () => {
    cy.get("#all").click();
    cy.get("#all").should("have.class", "btn-filter-active");

    cy.get("#pending").click();
    cy.get("#pending").should("have.class", "btn-filter-active");

    cy.get("#done").click();
    cy.get("#done").should("have.class", "btn-filter-active");
  });

  it("should search tasks", () => {
    cy.get("#input-text").type("estudar");
    cy.get("#search-word").click();

    cy.get(".todo-item").should("contain", "estudar");
  });
  it("should show error for tasks less than 5 characters", () => {
    cy.get("#input-text").type("test");
    cy.get("#error-span").should(
      "contain",
      "this field must have at least 5 characters!"
    );
    cy.get("#create-item").should("be.disabled");
  });

  it("should show error for tasks more than 100 characters", () => {
    const longText = "a".repeat(101);
    cy.get("#input-text").type(longText);
    cy.get("#error-span").should("contain", "limit of characters reached!");
    cy.get("#create-item").should("be.disabled");
  });

  it("should enable create button for valid input", () => {
    cy.get("#input-text").type("Valid task description");
    cy.get("#create-item").should("not.be.disabled");
  });

  it("should create task on Enter key", () => {
    cy.get("#input-text").type("Task created with Enter{enter}");
    cy.get(".todo-item").should("contain", "Task created with Enter");
  });
  it("should show alert when editing task with less than 5 characters", () => {
    cy.get("#input-text").type("Task to edit validation");
    cy.get("#create-item").click();

    cy.window().then((win) => {
      cy.stub(win, "alert").as("alertStub");
    });

    cy.get(".todo-item").first().find(".fa-pen").click();
    cy.get(".todo-item")
      .first()
      .find(".todo-item-content")
      .clear()
      .type("1234");
    cy.get(".todo-item").first().find(".fa-check").click();

    cy.get("@alertStub").should(
      "have.been.calledWith",
      "Todo must be at least 5 characters long!"
    );

    cy.get(".todo-item")
      .first()
      .find(".todo-item-content")
      .should("have.class", "editing");
    cy.get(".todo-item").first().find(".fa-check").should("exist");
  });
  it("should show alert when editing task with more than 100 characters", () => {
    cy.get("#input-text").type("Task to edit validation");
    cy.get("#create-item").click();
    cy.window().then((win) => {
      cy.stub(win, "alert").as("alertStub");
    });
    cy.get(".todo-item").first().find(".fa-pen").click();
    const longText =
      "lápidas de fogo que caem num trovão ardente, Deus é mais, filho de Jeová, fogo no parquinho! truvap de caeim maos";
    cy.get(".todo-item")
      .first()
      .find(".todo-item-content")
      .clear()
      .type(longText, { delay: 0 });
    cy.get(".todo-item").first().find(".fa-check").click();
    cy.get("@alertStub").should(
      "have.been.calledWith",
      "Todo cannot exceed 100 characters!"
    );
    cy.get(".todo-item")
      .first()
      .find(".todo-item-content")
      .should("have.class", "editing");
    cy.get(".todo-item").first().find(".fa-check").should("exist");
  });

  it("should show toast when task is completed", () => {
    cy.get("#input-text").type("Task for toast test");
    cy.get("#create-item").click();
    cy.get(".todo-item").first().find(".fa").click();
    cy.get(".toast").should("have.class", "show-toast");
    cy.get(".toast", { timeout: 3000 }).should("not.have.class", "show-toast");
  });
});
describe("DEV access level", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-testid='email']").type("dev@mail.com");
    cy.get("[data-testid='password']").type("password");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
  });

  it("should hide user creation button for dev", () => {
    cy.get('[data-js="user-button"]').should("have.class", "hide");
  });

  it("should disable task creation for dev", () => {
    cy.get("#input-text").should("be.disabled");
    cy.get("#input-text").should("have.class", "not-allowed");
    cy.get("#create-item").should("be.disabled");
  });

  it("should allow task status changes for dev", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa")
      .should("not.have.class", "not-allowed");
    cy.get(".todo-item").first().find(".fa").click();
    cy.get(".todo-item").first().should("have.class", "task-completed");
  });

  it("should disable task editing for dev", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa-pen")
      .should("have.class", "not-allowed");
  });

  it("should disable task deletion for dev", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa-trash")
      .should("have.class", "not-allowed");
  });
});
describe("client access level", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-testid='email']").type("client@mail.com");
    cy.get("[data-testid='password']").type("password");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
  });

  it("should hide user creation button for client", () => {
    cy.get('[data-js="user-button"]').should("have.class", "hide");
  });

  it("should disable task creation for client", () => {
    cy.get("#input-text").should("be.disabled");
    cy.get("#input-text").should("have.class", "not-allowed");
    cy.get("#create-item").should("be.disabled");
  });

  it("should disable task status changes for client", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa")
      .should("have.class", "not-allowed");
  });

  it("should disable task editing for client", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa-pen")
      .should("have.class", "not-allowed");
  });

  it("should disable task deletion for client", () => {
    cy.get(".todo-item")
      .first()
      .find(".fa-trash")
      .should("have.class", "not-allowed");
  });

  it("should only allow viewing tasks", () => {
    cy.get(".todo-item").should("exist");
    cy.get("#content").should("be.visible");
  });
});
describe("Authentication", () => {
  it("should logout successfully", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[data-testid='email']").type("manager@mail.com");
    cy.get("[data-testid='password']").type("dmaloc");
    cy.get("[data-testid='login-button']").click();
    cy.url().should("include", "todo.html");
    cy.window().its("localStorage").invoke("getItem", "token").should("exist");
    cy.get('[data-js="logout-button"]').click();
    cy.url().should("include", "index.html");
    cy.window()
      .its("localStorage")
      .invoke("getItem", "token")
      .should("be.null");
  });
});
