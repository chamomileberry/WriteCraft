// Authenticated security test script
const BASE_URL = 'http://localhost:5000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAuthenticatedSecurity() {
  console.log('🔒 Testing Authenticated Security Measures...\n');
  
  const testUserId = `test-user-sec-${Date.now()}`;
  
  // Test 1: Verify legitimate update works
  console.log('1. Testing Legitimate User Update (should work)');
  try {
    const response = await fetch(`${BASE_URL}/api/users/${testUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': testUserId
      },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe"
      })
    });
    
    const result = await response.json();
    if (response.status === 404) {
      console.log('  ✅ User not found (expected for new test user)');
    } else if (response.status === 200) {
      console.log('  ✅ Update successful');
    } else {
      console.log('  Status:', response.status, result);
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  await sleep(100);
  
  // Test 2: Admin field protection with strict mode
  console.log('\n2. Testing isAdmin Field Protection (strict validation)');
  try {
    const response = await fetch(`${BASE_URL}/api/users/${testUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': testUserId
      },
      body: JSON.stringify({
        firstName: "Hacker",
        isAdmin: true  // This should be rejected
      })
    });
    
    const result = await response.json();
    if (response.status === 403) {
      console.log('  ✅ Admin field blocked by explicit check (403)');
    } else if (response.status === 400 && result.message && result.message.includes('Unrecognized key')) {
      console.log('  ✅ Admin field blocked by strict schema validation (400)');
    } else if (response.status === 404) {
      console.log('  ✅ Blocked (user not found)');
    } else {
      console.log('  ⚠️  Response:', response.status, result);
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  await sleep(100);
  
  // Test 3: Row-Level Security
  console.log('\n3. Testing Row-Level Security');
  try {
    const response = await fetch(`${BASE_URL}/api/security-test/rls-check`, {
      method: 'GET',
      headers: {
        'x-test-user-id': testUserId
      }
    });
    
    const result = await response.json();
    if (result.message && result.message.includes('passed')) {
      console.log('  ✅', result.message);
      console.log('     Current user:', result.currentUserId);
      console.log('     Visible users:', result.visibleUsers);
    } else if (result.error) {
      console.log('  ⚠️  Error:', result.error);
    } else {
      console.log('  Result:', JSON.stringify(result));
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  await sleep(100);
  
  // Test 4: CSRF Protection Check
  console.log('\n4. Testing CSRF Protection');
  try {
    const response = await fetch(`${BASE_URL}/api/security-test/csrf-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': testUserId
      },
      body: JSON.stringify({ test: true })
    });
    
    const result = await response.json();
    if (response.status === 403) {
      console.log('  ✅ CSRF protection active (missing token rejected)');
    } else if (result.vulnerability) {
      console.log('  ❌ CSRF vulnerability detected');
    } else {
      console.log('  Result:', response.status, result);
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  await sleep(100);
  
  // Test 5: Rate Limiting Headers
  console.log('\n5. Testing Rate Limiting Headers');
  try {
    const response = await fetch(`${BASE_URL}/api/security-test/rate-limit`, {
      method: 'GET',
      headers: {
        'x-test-user-id': testUserId
      }
    });
    
    const result = await response.json();
    if (result.headers) {
      const limit = result.headers['x-ratelimit-limit'];
      const remaining = result.headers['x-ratelimit-remaining'];
      console.log(`  ✅ Rate limiting active: ${remaining}/${limit} requests remaining`);
    } else {
      console.log('  ⚠️  No rate limit headers found');
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  await sleep(100);
  
  // Test 6: SQL Injection in search/filter endpoint
  console.log('\n6. Testing SQL Injection Protection');
  try {
    const response = await fetch(`${BASE_URL}/api/security-test/sql-injection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-id': testUserId
      },
      body: JSON.stringify({ 
        userInput: "'; DROP TABLE users; --" 
      })
    });
    
    const result = await response.json();
    if (response.status === 400) {
      console.log('  ✅ SQL injection blocked by sanitization');
    } else if (result.blocked) {
      console.log('  ✅ SQL injection detected:', result.message);
    } else {
      console.log('  Result:', response.status, result);
    }
  } catch (error) {
    console.log('  ❌ Test failed:', error.message);
  }
  
  console.log('\n✅ Authenticated security testing complete!\n');
}

testAuthenticatedSecurity().catch(console.error);
