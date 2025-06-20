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
