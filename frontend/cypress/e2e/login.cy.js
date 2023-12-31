describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://127.0.0.1:5173/");
  });

  it("Inputting on Login", () => {
    cy.wait(2000); // Wait for 2 seconds
    cy.get('[data-cy="login-username"]')
      .should("be.visible")
      .type("admin", { force: true });
    // Type the password
    cy.get('[data-cy="login-password"]').type("admin", { force: true });

    // Click the login button
    cy.get('[data-cy="login-button"]').should("be.visible");
  });

  it("Clicking on Login Buttong", () => {
    cy.get('[data-cy="login-button"]').should("be.visible").click();
  });

  it("Changing to Register Screen", () => {
    cy.get('[data-cy="login-register-switch"]').click();
  });

  it("Clicking on Register Button", () => {
    cy.get('[data-cy="login-register-switch"]').click();
    cy.get('[data-cy="register-button"]').should("be.visible");
    cy.get('[data-cy="register-button"]').then(($button) => {
      console.log("Found the button:", $button);
      $button.click();
    });
  });
});
