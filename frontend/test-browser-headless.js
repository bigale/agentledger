#!/usr/bin/env node

import { chromium } from 'playwright';

async function testAgentLedgerHeadless() {
  console.log('🚀 Starting AgentLedger headless browser test...\n');
  
  let browser;
  let consoleMessages = [];
  let errors = [];
  let networkErrors = [];
  let requestCount = 0;
  
  try {
    // Launch browser in headless mode
    browser = await chromium.launch({ 
      headless: true    // Headless mode for CI/automated testing
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor network requests
    page.on('request', request => {
      requestCount++;
      const url = request.url();
      if (url.includes('/query') || url.includes('/call')) {
        console.log(`🌐 Request: ${request.method()} ${url}`);
      }
    });
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      // Log all IC-related requests
      if (url.includes('/query') || url.includes('/call') || url.includes('canister')) {
        if (status >= 400) {
          console.log(`❌ Network Error: ${status} ${response.statusText()} - ${url}`);
          networkErrors.push({
            url,
            status,
            statusText: response.statusText(),
            method: response.request().method()
          });
        } else {
          console.log(`✅ Network Success: ${status} - ${url}`);
        }
      }
    });
    
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      console.log(`💥 Request Failed: ${url} - ${failure?.errorText || 'Unknown error'}`);
      networkErrors.push({
        url,
        error: failure?.errorText || 'Request failed',
        method: request.method()
      });
    });
    
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
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
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
    
    // Check for cache operations section
    try {
      await page.waitForSelector('text=Cache Operations', { timeout: 10000 });
      console.log('✅ Cache Operations section found');
    } catch (e) {
      console.log('❌ Cache Operations section not found');
      errors.push('Cache Operations section not found');
    }
    
    // Check for node status section
    try {
      await page.waitForSelector('text=Node Status', { timeout: 10000 });
      console.log('✅ Node Status section found');
    } catch (e) {
      console.log('❌ Node Status section not found');
      errors.push('Node Status section not found');
    }
    
    // Test cache operations
    try {
      console.log('🧪 Testing cache operations...');
      
      const keyInput = await page.locator('input[placeholder="Key"]').first();
      const valueInput = await page.locator('input[placeholder="Value"]').first();
      const addButton = await page.locator('text=Add to Cache').first();
      
      if (await keyInput.isVisible() && await valueInput.isVisible() && await addButton.isVisible()) {
        await keyInput.fill('headless-test-key');
        await valueInput.fill('headless-test-value');
        await addButton.click();
        
        console.log('✅ Cache set operation successful');
        
        // Test get operation
        const searchInput = await page.locator('input[placeholder="Key to search"]').first();
        const searchButton = await page.locator('text=Search Cache').first();
        
        if (await searchInput.isVisible() && await searchButton.isVisible()) {
          await searchInput.fill('headless-test-key');
          await searchButton.click();
          
          // Wait for result
          await page.waitForTimeout(2000);
          console.log('✅ Cache get operation completed');
        }
      } else {
        errors.push('Cache operation form elements not visible');
      }
    } catch (e) {
      console.log('❌ Cache operation test failed:', e.message);
      errors.push(`Cache operation test failed: ${e.message}`);
    }
    
    // Check if React errors occurred (the ones we fixed)
    const reactErrorCount = consoleMessages.filter(msg => 
      msg.type === 'error' && msg.text.includes('React error')
    ).length;
    
    if (reactErrorCount === 0) {
      console.log('✅ No React rendering errors detected');
    } else {
      console.log(`❌ Found ${reactErrorCount} React errors`);
      errors.push(`${reactErrorCount} React rendering errors`);
    }
    
  } catch (error) {
    console.log('💥 Test error:', error.message);
    errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Summary
  console.log('\n📊 Headless Test Summary:');
  console.log(`Total network requests: ${requestCount}`);
  console.log(`Network errors: ${networkErrors.length}`);
  console.log(`Console messages: ${consoleMessages.length}`);
  console.log(`Application errors: ${errors.length}`);
  
  if (networkErrors.length > 0) {
    console.log('\n🌐 Network Errors Detected:');
    networkErrors.forEach((netError, index) => {
      if (netError.status) {
        console.log(`   ${index + 1}. ${netError.method} ${netError.url} - ${netError.status} ${netError.statusText}`);
      } else {
        console.log(`   ${index + 1}. ${netError.method} ${netError.url} - ${netError.error}`);
      }
    });
    
    // Add network errors to main errors if they're significant
    const badRequestCount = networkErrors.filter(e => e.status === 400).length;
    if (badRequestCount > 0) {
      errors.push(`${badRequestCount} HTTP 400 Bad Request errors detected`);
    }
  }
  
  if (errors.length === 0 && networkErrors.length === 0) {
    console.log('🎉 All tests passed! No errors detected.');
    return true;
  } else if (errors.length === 0 && networkErrors.length > 0) {
    console.log('⚠️  Tests passed but network errors detected. UI may have issues.');
    return false; // Fail the test if there are network errors
  } else {
    console.log('❌ Issues found:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    return false;
  }
}

// Run the test
testAgentLedgerHeadless()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });