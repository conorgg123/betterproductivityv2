/**
 * Daily Progress Tracker Setup Script
 * Run this script to set up the application with all required dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print a styled header
console.log(`
${colors.blue}=========================================================
${colors.cyan}  Daily Progress Tracker - Setup Script
${colors.blue}=========================================================
${colors.reset}
This script will help you set up the application with all required 
dependencies for the YouTube Manager and other features.
`);

// Check if package.json exists
if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
  console.log(`${colors.red}Error: package.json not found.${colors.reset}`);
  console.log(`${colors.yellow}Please run this script from the root directory of the project.${colors.reset}`);
  process.exit(1);
}

// Ask user to confirm installation
rl.question(`${colors.yellow}Do you want to install all dependencies? (y/n) ${colors.reset}`, (answer) => {
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log(`${colors.red}Installation cancelled.${colors.reset}`);
    rl.close();
    return;
  }

  console.log(`${colors.green}Installing dependencies...${colors.reset}`);
  
  try {
    // Step 1: Install main dependencies
    console.log(`\n${colors.cyan}[Step 1/3] Installing main dependencies...${colors.reset}`);
    execSync('npm install electron yt-dlp-exec electron-store chart.js --save', { stdio: 'inherit' });
    
    // Step 2: Install developer dependencies
    console.log(`\n${colors.cyan}[Step 2/3] Installing developer dependencies...${colors.reset}`);
    execSync('npm install @electron-forge/cli --save-dev', { stdio: 'inherit' });
    
    // Step 3: Import electron-forge
    console.log(`\n${colors.cyan}[Step 3/3] Configuring Electron Forge...${colors.reset}`);
    execSync('npx electron-forge import', { stdio: 'inherit' });
    
    console.log(`\n${colors.green}Dependencies installed successfully!${colors.reset}`);
    console.log(`\n${colors.yellow}To start the application in desktop mode with all features:${colors.reset}`);
    console.log(`${colors.cyan}npm start${colors.reset}`);
    
    console.log(`\n${colors.yellow}To package the application for distribution:${colors.reset}`);
    console.log(`${colors.cyan}npm run make${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error installing dependencies:${colors.reset}`, error.message);
    console.log(`\n${colors.yellow}Please try installing dependencies manually:${colors.reset}`);
    console.log(`${colors.cyan}npm install electron yt-dlp-exec electron-store chart.js --save${colors.reset}`);
    console.log(`${colors.cyan}npm install @electron-forge/cli --save-dev${colors.reset}`);
    console.log(`${colors.cyan}npx electron-forge import${colors.reset}`);
  }
  
  rl.close();
}); 