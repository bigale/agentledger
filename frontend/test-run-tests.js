#!/usr/bin/env node

import { chromium } from 'playwright';

async function testRunTestsButton() {
  console.log('🧪 Testing the Run Tests button functionality...\n');
  
  let browser;
  let testResults = [];
  let consoleMessages = [];
  let errors = [];
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000    // Slow down to see what's happening
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages for test output
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
        errors.push(text);
      } else if (text.includes('test') || text.includes('Test') || text.includes('✓') || text.includes('✗') || text.includes('PASS') || text.includes('FAIL')) {
        console.log(`🧪 Test Output: ${text}`);
      }
    });
    
    // Navigate to the app
    console.log('📍 Navigating to AgentLedger...');
    await page.goto('http://u6s2n-gx777-77774-qaaba-cai.localhost:8080/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Hard reload to ensure latest code
    console.log('🔄 Hard refreshing to get latest code...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for initial load
    console.log('⏳ Waiting for app to load...');
    await page.waitForTimeout(5000);
    
    // Find the Test Suite section
    console.log('🔍 Looking for Test Suite section...');
    try {
      await page.waitForSelector('text=Test Suite', { timeout: 10000 });
      console.log('✅ Found Test Suite section');
    } catch (e) {
      console.log('❌ Could not find Test Suite section');
      throw new Error('Test Suite section not found');
    }
    
    // Look for the Run Tests button
    console.log('🔍 Looking for Run Tests button...');
    let runTestsButton;
    
    try {
      // Try different possible selectors for the Run Tests button
      const possibleSelectors = [
        'text=Run Tests',
        'text=Run All Tests', 
        'button:has-text("Run")',
        'button:has-text("Test")',
        '[data-testid="run-tests"]',
        '.test-suite button',
        'button[class*="bg-blue"]'  // Often blue buttons
      ];
      
      for (const selector of possibleSelectors) {
        try {
          runTestsButton = await page.locator(selector).first();
          if (await runTestsButton.isVisible()) {
            console.log(`✅ Found Run Tests button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!runTestsButton || !(await runTestsButton.isVisible())) {
        // Let's see what buttons are actually available in the Test Suite area
        console.log('🔍 Scanning for buttons in Test Suite area...');
        const testSuiteSection = await page.locator('text=Test Suite').locator('..').locator('..');
        const buttons = await testSuiteSection.locator('button').all();
        
        console.log(`Found ${buttons.length} buttons in Test Suite area:`);
        for (let i = 0; i < buttons.length; i++) {
          const buttonText = await buttons[i].textContent();
          console.log(`   ${i + 1}. "${buttonText}"`);
          if (buttonText && (buttonText.includes('Run') || buttonText.includes('Test') || buttonText.includes('Start'))) {
            runTestsButton = buttons[i];
            console.log(`✅ Using button: "${buttonText}"`);
            break;
          }
        }
      }
      
    } catch (e) {
      console.log('❌ Error finding Run Tests button:', e.message);
    }
    
    if (!runTestsButton || !(await runTestsButton.isVisible())) {
      console.log('❌ Could not find Run Tests button');
      
      // Take a screenshot to help debug
      await page.screenshot({ path: 'test-suite-debug.png', fullPage: true });
      console.log('📸 Debug screenshot saved as test-suite-debug.png');
      
      throw new Error('Run Tests button not found');
    }
    
    // Click the Run Tests button
    console.log('🖱️  Clicking Run Tests button...');
    await runTestsButton.click();
    
    console.log('⏳ Waiting for tests to run...');
    await page.waitForTimeout(2000);
    
    // Look for test results in the UI
    console.log('🔍 Scanning for test results...');
    
    // Check for common test result indicators
    const testResultSelectors = [
      'text=✓',
      'text=✗', 
      'text=PASS',
      'text=FAIL',
      'text=passed',
      'text=failed',
      '.test-result',
      '.test-output',
      '[data-testid*="test"]'
    ];
    
    for (const selector of testResultSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`Found ${elements.length} test result elements with selector: ${selector}`);
          for (let i = 0; i < Math.min(elements.length, 10); i++) {
            const text = await elements[i].textContent();
            console.log(`   Result ${i + 1}: ${text}`);
            testResults.push(text);
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Wait a bit more to see if more results appear
    console.log('⏳ Waiting for additional test results...');
    await page.waitForTimeout(5000);
    
    // Look for any text that might contain test results
    console.log('🔍 Scanning page content for test-related text...');
    const pageContent = await page.textContent('body');
    
    // Look for patterns that suggest test results
    const testPatterns = [
      /\d+\/\d+ tests? passed/i,
      /\d+ passed/i,
      /\d+ failed/i,
      /test.*complete/i,
      /✓.*test/i,
      /✗.*test/i,
      /error.*test/i,
      /success.*test/i
    ];
    
    const foundPatterns = [];
    for (const pattern of testPatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        foundPatterns.push(matches[0]);
        console.log(`📋 Found test pattern: ${matches[0]}`);
      }
    }
    
    // Take a screenshot after running tests
    console.log('📸 Taking screenshot after running tests...');
    await page.screenshot({ path: 'test-results.png', fullPage: true });
    console.log('✅ Screenshot saved as test-results.png');
    
    // Wait a bit more to observe the results
    console.log('⏳ Observing final results...');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.log('💥 Test error:', error.message);
    errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Summary
  console.log('\n📊 Run Tests Button Test Summary:');
  console.log(`🧪 Test results found: ${testResults.length}`);
  console.log(`❌ Errors found: ${errors.length}`);
  console.log(`📝 Console messages: ${consoleMessages.length}`);
  
  if (testResults.length > 0) {
    console.log('\n🧪 Test Results:');
    testResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors Found:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  // Check for test failures
  const hasFailures = testResults.some(result => 
    result.includes('✗') || 
    result.includes('FAIL') || 
    result.includes('failed') || 
    result.includes('error')
  );
  
  if (hasFailures) {
    console.log('\n⚠️  Test failures detected in the output!');
    return false;
  } else if (testResults.length > 0) {
    console.log('\n🎉 Tests appear to have run successfully!');
    return true;
  } else {
    console.log('\n❓ Could not determine test results - check screenshots for details.');
    return false;
  }
}

// Run the test
testRunTestsButton()
  .then(success => {
    console.log(success ? '\n✅ Run Tests button test completed successfully!' : '\n⚠️  Issues found with test suite.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });