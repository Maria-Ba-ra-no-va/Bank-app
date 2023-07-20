/// <reference types="cypress" />
describe('Приложение Bank', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
  });

  it.only('тест пройден успешно', () => {
    cy.get('#username').type('developer');
    cy.get('#password').type('skillbox');
    cy.contains('Войти').click();
    cy.request({
      url: 'http://localhost:3000/login',
      method: 'POST',
      body: JSON.stringify({
        login: 'developer',
        password: 'skillbox',
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .should((response) => {
        expect(response.status).to.eq(200)
      })
    cy.get('h1').should('contain.text', 'Ваши счета');
    cy.request({
      url: 'http://localhost:3000/accounts',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ZGV2ZWxvcGVyOnNraWxsYm94`,
      }
    })
      .should((response) => {
        expect(response.status).to.eq(200)
      })
    cy.get('.account__number', { timeout: 15000 })
      .should('contain.text', '74213041477477406320783754')
    cy.get('button').contains('Создать новый счёт').click();
    cy.get('.account__date:last', { timeout: 15000 }).should('contain.text', '')
    cy.get('button:nth(5)', { timeout: 15000 }).contains('Открыть').click();
    cy.get('.form-translation__input-account').type('37648547607474267212535343');
    cy.get('.form-translation__input-sum').type('100');
    cy.get('button').contains('Отправить').click();
    cy.get('.table__tbody > :nth-child(1) > :nth-child(1)').should('contain.text', '74213041477477406320783754');
    cy.get('.table__tbody > :nth-child(1) > :nth-child(2)').should('contain.text', '37648547607474267212535343');
    cy.get('.table__tbody > :nth-child(1) > :nth-child(3)').should('contain.text', '- 100 ₽');
  });
});
