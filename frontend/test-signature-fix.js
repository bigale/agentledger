#!/usr/bin/env node

import { chromium } from 'playwright';

async function testSignatureFix() {
  console.log('🔍 Testing IC signature verification fix...\n');
  
  let browser;
  let consoleMessages = [];
  let networkErrors = [];
  let signatureErrors = [];
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages for signature-related errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      
      // Look for signature-related errors
      if (text.includes('signature') || text.includes('delegation') || text.includes('threshold')) {
        console.log(`🔐 Signature-related message (${type}): ${text}`);
        signatureErrors.push({ type, text });
      } else if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'log' && text.includes('actor') || text.includes('agent')) {
        console.log(`ℹ️  Agent Log: ${text}`);
      }
    });
    
    // Monitor network for specific signature/delegation errors
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('/query') || url.includes('/call')) {
        if (status >= 400) {
          console.log(`❌ Network Error: ${status} - ${url}`);
          networkErrors.push({ url, status, statusText: response.statusText() });
        } else {
          console.log(`✅ Network Success: ${status} - ${url.split('/').pop()}`);
        }
      }
    });
    
    // Navigate to the app
    console.log('📍 Navigating to AgentLedger via canister URL...');
    await page.goto('http://u6s2n-gx777-77774-qaaba-cai.localhost:8080/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for initial load
    console.log('⏳ Waiting for app to load...');
    await page.waitForTimeout(5000);
    
    // Check if the app loaded successfully
    try {
      const heading = await page.textContent('h1');
      if (heading && heading.includes('Self-Healing Distributed Cache')) {
        console.log('✅ App loaded successfully');
      } else {
        console.log('❌ App may not have loaded properly');
      }
    } catch (e) {
      console.log('❌ Failed to find app heading');
    }
    
    // Test cache operations that might trigger signature verification
    console.log('🧪 Testing cache operations...');
    
    try {
      // Try to fill and submit the cache form
      await page.fill('input[placeholder="Key"]', 'signature-test-key');
      await page.fill('input[placeholder="Value"]', 'signature-test-value');
      await page.click('text=Add to Cache');
      
      console.log('⏳ Waiting for cache operation to complete...');
      await page.waitForTimeout(3000);
      
      // Try a search operation
      await page.fill('input[placeholder="Key to search"]', 'signature-test-key');
      await page.click('text=Search Cache');
      
      console.log('⏳ Waiting for search operation to complete...');
      await page.waitForTimeout(3000);
      
    } catch (e) {
      console.log('❌ Cache operation test failed:', e.message);
    }
    
    // Wait a bit more to catch any delayed errors
    console.log('⏳ Monitoring for additional signature errors...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('💥 Test error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Report results
  console.log('\n📊 Signature Fix Test Results:');
  console.log(`🔐 Signature-related errors: ${signatureErrors.length}`);
  console.log(`❌ Network errors: ${networkErrors.length}`);
  console.log(`📝 Total console messages: ${consoleMessages.length}`);
  
  if (signatureErrors.length > 0) {
    console.log('\n🔐 Signature Error Details:');
    signatureErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.type}] ${error.text}`);
    });
  }
  
  if (networkErrors.length > 0) {
    console.log('\n❌ Network Error Details:');
    networkErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.status} - ${error.url}`);
    });
  }
  
  if (signatureErrors.length === 0 && networkErrors.length === 0) {
    console.log('🎉 SUCCESS: No signature verification errors detected!');
    return true;
  } else {
    console.log('⚠️  Signature verification issues still present.');
    return false;
  }
}

// Run the test
testSignatureFix()
  .then(success => {
    console.log(success ? '\n✅ Signature fix test passed!' : '\n❌ Signature fix test failed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });