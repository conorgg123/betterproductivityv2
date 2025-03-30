/**
 * E2E tests for Dashboard
 * Uses Cypress to test dashboard functionality
 */

describe('Dashboard', () => {
  beforeEach(() => {
    // Visit the dashboard page
    cy.visit('dashboard.html');
    
    // Intercept calls that would fetch data and return mock data
    cy.intercept('GET', '**/timeTracking*', { fixture: 'timeTrackingData.json' }).as('getTimeTracking');
    cy.intercept('GET', '**/tasks*', { fixture: 'tasksData.json' }).as('getTasks');
    cy.intercept('GET', '**/projects*', { fixture: 'projectsData.json' }).as('getProjects');
  });

  it('displays current date correctly', () => {
    // Check if the current date is displayed in the expected format
    // This assumes the format is "Day, Month Day, Year" (e.g., "Monday, April 3, 2023")
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    const expectedDatePattern = `${day}, ${month} ${date}, ${year}`;
    cy.get('.current-date').should('contain', expectedDatePattern);
  });

  it('shows the correct daily summary metrics', () => {
    // Check if the Daily Summary card displays the expected metrics
    cy.get('.daily-summary-card').within(() => {
      cy.get('.analytics-card').should('have.length', 4);
      cy.get('.analytics-label').contains('Focus');
      cy.get('.analytics-label').contains('Meetings');
      cy.get('.analytics-label').contains('Breaks');
      cy.get('.analytics-label').contains('Other');
    });
  });

  it('changes the date when navigation buttons are clicked', () => {
    // Get the initial date text
    cy.get('.current-date').invoke('text').as('initialDate');
    
    // Click the previous day button
    cy.get('.nav-button').first().click();
    
    // Check that the date has changed
    cy.get('.current-date').invoke('text').then((newDate) => {
      cy.get('@initialDate').then((initialDate) => {
        expect(newDate).not.to.equal(initialDate);
      });
    });
    
    // Click the next day button twice to go to the day after the initial date
    cy.get('.nav-button').eq(1).click().click();
    
    // Check that the date has changed again
    cy.get('.current-date').invoke('text').then((newDate) => {
      cy.get('@initialDate').then((initialDate) => {
        expect(newDate).not.to.equal(initialDate);
      });
    });
  });

  it('changes the view when different view options are clicked', () => {
    // Check that the "Day" view is active by default
    cy.get('.view-option').first().should('have.class', 'active');
    
    // Click the "Week" view
    cy.get('.view-option').eq(1).click();
    
    // Check that "Week" view is now active
    cy.get('.view-option').eq(1).should('have.class', 'active');
    cy.get('.view-option').first().should('not.have.class', 'active');
    
    // The UI should update to show week data
    // This would depend on your specific implementation
    cy.get('.dashboard-grid').should('be.visible');
  });

  it('displays the correct number of timeline hours', () => {
    // Check if the Timeline card displays the expected hours
    cy.get('.timeline-card').within(() => {
      cy.get('.timeline-hour').should('have.length', 12); // 9 AM to 8 PM
      cy.get('.timeline-hour').first().should('contain', '9 AM');
      cy.get('.timeline-hour').last().should('contain', '8 PM');
    });
  });

  it('shows projects in the Projects & Tasks section', () => {
    // Check if the Projects & Tasks card shows projects
    cy.get('.projects-card').within(() => {
      cy.get('.projects-container').should('be.visible');
      // Assuming projects are added to the DOM, we would check for them
      // This will depend on your specific implementation
    });
  });

  it('shows apps in the Apps & Websites section', () => {
    // Check if the Apps & Websites card shows apps
    cy.get('.apps-websites-card').within(() => {
      cy.get('.apps-list').should('be.visible');
      // Assuming apps are added to the DOM, we would check for them
      // This will depend on your specific implementation
    });
  });
}); 