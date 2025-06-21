// describe("login page", () => {
//   beforeEach(() => {
//     cy.visit("http://localhost:5173/");
//   });

//   it("should show validation errors when login button is clicked with empty fields", () => {
//     cy.get("[data-testid='login-button']").click();

//     cy.get("[data-testid='error-span-email']")
//       .should("be.visible")
//       .and("contain.text", "Email is required.");

//     cy.get("[data-testid='error-span-password']")
//       .should("be.visible")
//       .and("contain.text", "Password is required.");
//   });
//   it("should show alert with invalid credentials when user does not exist", () => {
//     cy.get("[data-testid='email']").type("invalid@mail.com");
//     cy.get("[data-testid='password']").type("tupatupatupa");

//     cy.window().then((win) => {
//       cy.stub(win, "alert").as("windowAlert");
//     });

//     cy.get("[data-testid='login-button']").click();

//     cy.get("@windowAlert").should(
//       "have.been.calledWith",
//       "Login failed: Invalid credentials"
//     );
//     cy.url().should("include", "localhost:5173");
//   });
//   it("should hide error spans when valid input is entered after showing errors", () => {
//     cy.get("[data-testid='login-button']").click();
//     cy.get("[data-testid='error-span-email']").should(
//       "have.class",
//       "error-span-visible"
//     );
//     cy.get("[data-testid='error-span-password']").should(
//       "have.class",
//       "error-span-visible"
//     );
//     cy.get("[data-testid='email']").type("manager@mail.com");
//     cy.get("[data-testid='login-button']").click();
//     cy.get("[data-testid='error-span-email']").should(
//       "not.have.class",
//       "error-span-visible"
//     );
//     cy.get("[data-testid='error-span-password']").should(
//       "have.class",
//       "error-span-visible"
//     );
//     cy.get("[data-testid='password']").type("dmaloc");
//     cy.get("[data-testid='login-button']").click();
//     cy.url().should("include", "todo.html");
//   });
//   it("should successfully login with valid manager credentials", () => {
//     cy.get("[data-testid='email']").type("manager@mail.com");
//     cy.get("[data-testid='password']").type("dmaloc");
//     cy.get("[data-testid='login-button']").click();
//     cy.url().should("include", "todo.html");
//   });
// });
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
});
