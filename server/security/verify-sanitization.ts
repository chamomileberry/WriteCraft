#!/usr/bin/env tsx
/**
 * Script to verify that input sanitization is working correctly
 * Run this after making changes to ensure protection is active
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test payloads with various injection attempts
const testPayloads = {
  sqlInjection: {
    firstName: "'; DROP TABLE users; --",
    lastName: "' OR '1'='1"
  },
  xssAttempt: {
    firstName: "<script>alert('XSS')</script>",
    lastName: "<img src=x onerror=alert('XSS')>"
  },
  prototypePolIution: {
    __proto__: { isAdmin: true },
    constructor: { prototype: { isAdmin: true } }
  },
  adminEscalation: {
    isAdmin: true,
    firstName: "Hacker"
  },
  longString: {
    firstName: "A".repeat(11000) // Exceeds max length
  }
};

async function testSanitization() {
  console.log('🔒 Testing Input Sanitization...\n');
  
  // Test SQL injection protection
  console.log('1. Testing SQL Injection Protection:');
  try {
    const response = await fetch(`${BASE_URL}/api/security-test/sql-injection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': 'test-user-security'
      },
      body: JSON.stringify({ userInput: "'; DROP TABLE users; --" })
    });
    
    const result = await response.json();
    if (response.status === 400) {
      console.log('  ✅ SQL injection blocked by sanitization');
    } else if (result.blocked) {
      console.log('  ✅ SQL injection detected and blocked');
    } else {
      console.log('  ❌ SQL injection not blocked!');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error);
  }
  
  // Test XSS protection
  console.log('\n2. Testing XSS Protection:');
  try {
    const response = await fetch(`${BASE_URL}/api/users/test-user-security`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': 'test-user-security'
      },
      body: JSON.stringify(testPayloads.xssAttempt)
    });
    
    if (response.status === 400) {
      console.log('  ✅ XSS attempt blocked');
    } else {
      console.log('  ⚠️  Check if XSS is properly sanitized');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error);
  }
  
  // Test prototype pollution protection
  console.log('\n3. Testing Prototype Pollution Protection:');
  try {
    const response = await fetch(`${BASE_URL}/api/users/test-user-security`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': 'test-user-security'
      },
      body: JSON.stringify(testPayloads.prototypePolIution)
    });
    
    const result = await response.json();
    if (response.status === 400 || response.status === 403) {
      console.log('  ✅ Prototype pollution blocked');
    } else {
      console.log('  ❌ Prototype pollution not blocked!');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error);
  }
  
  // Test admin field protection
  console.log('\n4. Testing Admin Field Protection:');
  try {
    const response = await fetch(`${BASE_URL}/api/users/test-user-security`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': 'test-user-security'
      },
      body: JSON.stringify(testPayloads.adminEscalation)
    });
    
    if (response.status === 403) {
      console.log('  ✅ Admin field modification blocked');
    } else if (response.status === 400) {
      console.log('  ✅ Admin field rejected by validation');
    } else {
      console.log('  ❌ Admin field protection may be compromised');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error);
  }
  
  // Test string length limits
  console.log('\n5. Testing String Length Limits:');
  try {
    const response = await fetch(`${BASE_URL}/api/users/test-user-security`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': 'test-user-security'
      },
      body: JSON.stringify(testPayloads.longString)
    });
    
    if (response.status === 400) {
      console.log('  ✅ Long string rejected');
    } else {
      console.log('  ⚠️  String length may not be limited');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error);
  }
  
  console.log('\n✅ Sanitization tests complete!');
  console.log('Review the results above to ensure all protections are active.');
}

// Run the tests
testSanitization().catch(console.error);

export { testSanitization };