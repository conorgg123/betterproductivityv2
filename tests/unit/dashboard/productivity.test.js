/**
 * Unit tests for Dashboard Productivity calculations
 */

// Mock data
const mockTimeTrackingData = [
  {
    appName: 'Visual Studio Code',
    category: 'Productive',
    startTime: '2025-03-29T09:00:00.000Z',
    endTime: '2025-03-29T10:30:00.000Z',
    duration: 5400, // 1.5 hours in seconds
    projectId: 'proj-finwall-app'
  },
  {
    appName: 'Zoom',
    category: 'Meetings',
    startTime: '2025-03-29T11:00:00.000Z',
    endTime: '2025-03-29T12:00:00.000Z',
    duration: 3600, // 1 hour in seconds
    projectId: null
  },
  {
    appName: 'Break',
    category: 'Breaks',
    startTime: '2025-03-29T12:00:00.000Z',
    endTime: '2025-03-29T12:30:00.000Z',
    duration: 1800, // 30 minutes in seconds
    projectId: null
  },
  {
    appName: 'Figma',
    category: 'Productive',
    startTime: '2025-03-29T13:00:00.000Z',
    endTime: '2025-03-29T15:00:00.000Z',
    duration: 7200, // 2 hours in seconds
    projectId: 'proj-finwall-app'
  }
];

// Mock the global localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};

// Import our functions directly from dashboard.js
// Note: In a real environment, we would need to modularize dashboard.js
// to make this testable without the DOM
const { calculateProductivityMetrics } = require('../../../dashboard');

describe('Dashboard Productivity Calculations', () => {
  
  test('calculateProductivityMetrics returns correct productivity percentage', () => {
    // Arrange
    const expectedProductiveTime = 12600; // 3.5 hours in seconds
    const expectedTotalTime = 18000; // 5 hours in seconds
    const expectedProductivityPercentage = 70; // (3.5/5) * 100
    
    // Mock getUserProductivityTarget and getUserDailyWorkHours
    const originalGetUserProductivityTarget = getUserProductivityTarget;
    const originalGetUserDailyWorkHours = getUserDailyWorkHours;
    
    global.getUserProductivityTarget = jest.fn().mockReturnValue(85);
    global.getUserDailyWorkHours = jest.fn().mockReturnValue(8);
    
    // Act
    const result = calculateProductivityMetrics(mockTimeTrackingData);
    
    // Assert
    expect(result.productiveTime).toBe(expectedProductiveTime);
    expect(result.totalTime).toBe(expectedTotalTime);
    expect(result.productivityPercentage).toBe(expectedProductivityPercentage);
    expect(result.targetPercentage).toBe(85);
    expect(result.targetHours).toBe(8);
    
    // Clean up
    global.getUserProductivityTarget = originalGetUserProductivityTarget;
    global.getUserDailyWorkHours = originalGetUserDailyWorkHours;
  });
  
  test('calculateProductivityMetrics handles empty data', () => {
    // Arrange
    const emptyData = [];
    
    // Mock getUserProductivityTarget and getUserDailyWorkHours
    const originalGetUserProductivityTarget = getUserProductivityTarget;
    const originalGetUserDailyWorkHours = getUserDailyWorkHours;
    
    global.getUserProductivityTarget = jest.fn().mockReturnValue(85);
    global.getUserDailyWorkHours = jest.fn().mockReturnValue(8);
    
    // Act
    const result = calculateProductivityMetrics(emptyData);
    
    // Assert
    expect(result.productiveTime).toBe(0);
    expect(result.totalTime).toBe(0);
    expect(result.productivityPercentage).toBe(0);
    expect(result.targetPercentage).toBe(85);
    expect(result.targetHours).toBe(8);
    
    // Clean up
    global.getUserProductivityTarget = originalGetUserProductivityTarget;
    global.getUserDailyWorkHours = originalGetUserDailyWorkHours;
  });
}); 