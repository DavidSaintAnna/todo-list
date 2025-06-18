describe("login page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
  });

  it("should show validation errors when login button is clicked with empty fields", () => {
    cy.get("[data-js='login-button']").click();

    cy.get("[data-js='error-span-email']")
      .should("be.visible")
      .and("contain.text", "Email is required.");

    cy.get("[data-js='error-span-password']")
      .should("be.visible")
      .and("contain.text", "Password is required.");
  });
});
