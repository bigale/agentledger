#!/usr/bin/env node

import { chromium } from 'playwright';

async function monitorNetworkErrors() {
  console.log('🔍 Starting long-running network monitoring...\n');
  
  let browser;
  let networkErrors = [];
  let requestCount = 0;
  let errorCount = 0;
  
  try {
    browser = await chromium.launch({ 
      headless: false,   // Show browser so you can see what's happening
      slowMo: 100       // Slow down actions
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track all network activity
    page.on('request', request => {
      requestCount++;
      const url = request.url();
      if (url.includes('/query') || url.includes('/call')) {
        const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm
        console.log(`[${timestamp}] 🌐 Request #${requestCount}: ${request.method()} ${url}`);
      }
    });
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const timestamp = new Date().toISOString().substring(11, 23);
      
      if (url.includes('/query') || url.includes('/call') || url.includes('canister')) {
        if (status >= 400) {
          errorCount++;
          console.log(`[${timestamp}] ❌ ERROR #${errorCount}: ${status} ${response.statusText()} - ${url}`);
          networkErrors.push({
            timestamp,
            url,
            status,
            statusText: response.statusText(),
            method: response.request().method()
          });
        } else if (status === 200 || status === 202) {
          console.log(`[${timestamp}] ✅ Success: ${status} - ${url.split('/').pop()}`);
        }
      }
    });
    
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      const timestamp = new Date().toISOString().substring(11, 23);
      errorCount++;
      console.log(`[${timestamp}] 💥 FAILED #${errorCount}: ${url} - ${failure?.errorText || 'Unknown error'}`);
      networkErrors.push({
        timestamp,
        url,
        error: failure?.errorText || 'Request failed',
        method: request.method()
      });
    });
    
    // Navigate to the app using the canister URL (like the user does)
    const appUrl = 'http://u6s2n-gx777-77774-qaaba-cai.localhost:8080/';
    console.log('📍 Navigating to AgentLedger via canister URL:', appUrl);
    await page.goto(appUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for initial load
    console.log('⏳ Waiting for initial load...');
    await page.waitForTimeout(5000);
    
    // Try to interact with the UI to trigger more requests
    try {
      console.log('🧪 Interacting with cache operations...');
      
      // Fill out cache form
      await page.fill('input[placeholder="Key"]', 'monitor-test-key');
      await page.fill('input[placeholder="Value"]', 'monitor-test-value');
      await page.click('text=Add to Cache');
      
      console.log('⏳ Waiting after cache set...');
      await page.waitForTimeout(3000);
      
      // Try a search
      await page.fill('input[placeholder="Key to search"]', 'monitor-test-key');
      await page.click('text=Search Cache');
      
      console.log('⏳ Waiting after cache get...');
      await page.waitForTimeout(3000);
      
    } catch (e) {
      console.log('⚠️  UI interaction failed:', e.message);
    }
    
    // Monitor for a full minute to catch polling/refresh requests
    console.log('🕐 Monitoring network activity for 60 seconds...');
    console.log('   (This will catch any polling or auto-refresh requests)');
    
    const monitorDuration = 60 * 1000; // 60 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < monitorDuration) {
      await page.waitForTimeout(1000);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      if (elapsed % 10 === 0) {
        console.log(`   📊 ${elapsed}s elapsed - Requests: ${requestCount}, Errors: ${errorCount}`);
      }
    }
    
  } catch (error) {
    console.log('💥 Monitor error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Final report
  console.log('\n📊 Network Monitoring Report:');
  console.log(`🌐 Total requests monitored: ${requestCount}`);
  console.log(`❌ Total errors detected: ${errorCount}`);
  
  if (networkErrors.length > 0) {
    console.log('\n🔍 Error Details:');
    networkErrors.forEach((error, index) => {
      if (error.status) {
        console.log(`   ${index + 1}. [${error.timestamp}] ${error.method} - HTTP ${error.status} ${error.statusText}`);
        console.log(`      URL: ${error.url}`);
      } else {
        console.log(`   ${index + 1}. [${error.timestamp}] ${error.method} - ${error.error}`);
        console.log(`      URL: ${error.url}`);
      }
    });
    
    // Group errors by type
    const errorsByStatus = {};
    networkErrors.forEach(error => {
      const key = error.status || error.error;
      errorsByStatus[key] = (errorsByStatus[key] || 0) + 1;
    });
    
    console.log('\n📈 Error Summary:');
    Object.entries(errorsByStatus).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} occurrences`);
    });
    
    return false;
  } else {
    console.log('🎉 No network errors detected during monitoring period!');
    return true;
  }
}

// Run the monitor
monitorNetworkErrors()
  .then(success => {
    console.log(success ? '\n✅ Monitoring completed successfully' : '\n❌ Network issues detected');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Monitor error:', error);
    process.exit(1);
  });