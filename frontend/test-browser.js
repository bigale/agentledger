#!/usr/bin/env node

import { chromium } from 'playwright';

async function testAgentLedger() {
  console.log('🚀 Starting AgentLedger browser test...\n');
  
  let browser;
  let consoleMessages = [];
  let errors = [];
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000    // Slow down by 1 second between actions
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
        errors.push(text);
      } else if (type === 'warn') {
        console.log(`⚠️  Console Warning: ${text}`);
      } else if (type === 'log' && !text.includes('Failed to get cache')) {
        console.log(`ℹ️  Console Log: ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
      errors.push(error.message);
    });
    
    // Navigate to the AgentLedger app
    const url = 'http://u6s2n-gx777-77774-qaaba-cai.localhost:8080/';
    console.log(`📍 Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for the app to load
    console.log('⏳ Waiting for app to load...');
    await page.waitForTimeout(3000);
    
    // Check if the main heading is present
    const heading = await page.textContent('h1');
    if (heading && heading.includes('Self-Healing Distributed Cache')) {
      console.log('✅ Main heading found:', heading);
    } else {
      console.log('❌ Main heading not found');
      errors.push('Main heading not found');
    }
    
    // Check for the "Connecting to distributed cache..." loading message
    const loadingText = await page.textContent('body');
    if (loadingText && loadingText.includes('Connecting to distributed cache')) {
      console.log('⏳ Still showing loading message - app may not be fully connected');
    } else {
      console.log('✅ App appears to be past loading stage');
    }
    
    // Check for cache operations section
    try {
      await page.waitForSelector('text=Cache Operations', { timeout: 5000 });
      console.log('✅ Cache Operations section found');
    } catch (e) {
      console.log('❌ Cache Operations section not found');
      errors.push('Cache Operations section not found');
    }
    
    // Check for node status section
    try {
      await page.waitForSelector('text=Node Status', { timeout: 5000 });
      console.log('✅ Node Status section found');
    } catch (e) {
      console.log('❌ Node Status section not found');
      errors.push('Node Status section not found');
    }
    
    // Try to test a simple cache operation
    try {
      console.log('🧪 Testing cache set operation...');
      
      // Find the key input field
      const keyInput = await page.locator('input[placeholder="Key"]').first();
      const valueInput = await page.locator('input[placeholder="Value"]').first();
      const addButton = await page.locator('text=Add to Cache').first();
      
      if (await keyInput.isVisible() && await valueInput.isVisible() && await addButton.isVisible()) {
        await keyInput.fill('test-browser-key');
        await valueInput.fill('test-browser-value');
        await addButton.click();
        
        console.log('✅ Cache operation form interaction successful');
        
        // Wait a bit to see if there are any errors
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ Cache operation form elements not found');
        errors.push('Cache operation form elements not found');
      }
    } catch (e) {
      console.log('❌ Cache operation test failed:', e.message);
      errors.push(`Cache operation test failed: ${e.message}`);
    }
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'agentledger-test.png', fullPage: true });
    console.log('✅ Screenshot saved as agentledger-test.png');
    
    // Wait a bit more to observe the page
    console.log('⏳ Observing page for 5 more seconds...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('💥 Test error:', error.message);
    errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Errors found: ${errors.length}`);
  
  if (errors.length === 0) {
    console.log('🎉 All tests passed! AgentLedger appears to be working correctly.');
  } else {
    console.log('❌ Issues found:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n📝 Console message breakdown:');
  const messageTypes = consoleMessages.reduce((acc, msg) => {
    acc[msg.type] = (acc[msg.type] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(messageTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} messages`);
  });
  
  return errors.length === 0;
}

// Run the test
testAgentLedger()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });