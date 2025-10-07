import { readFileSync } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function doImport() {
  const zipPath = './attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip';
  const zipBuffer = readFileSync(zipPath);

  console.log(`📦 Loading ZIP file: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', zipBuffer, {
    filename: 'World-The-Green-Tide.zip',
    contentType: 'application/zip'
  });

  console.log('🔐 Logging in as test user...');
  
  // Login first to get session
  const loginRes = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'test-import-user',
      password: 'test123'
    })
  });
  
  const cookies = loginRes.headers.raw()['set-cookie'];
  
  if (!loginRes.ok) {
    console.log('❌ Login failed, user might not exist. Creating...');
    // Register the user
    const registerRes = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test-import-user',
        password: 'test123',
        email: 'import@test.com'
      })
    });
    
    if (!registerRes.ok) {
      console.error('❌ Registration failed:', await registerRes.text());
      return;
    }
    
    // Login again
    const loginRes2 = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test-import-user',
        password: 'test123'
      })
    });
    
    const cookies2 = loginRes2.headers.raw()['set-cookie'];
    if (!loginRes2.ok) {
      console.error('❌ Second login failed');
      return;
    }
    
    console.log('✓ User created and logged in');
    
    // Upload with new session
    console.log('📤 Uploading ZIP file to /api/import/upload...');
    const uploadRes = await fetch('http://localhost:5000/api/import/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Cookie': cookies2.join('; ')
      }
    });
    
    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      console.error('❌ Upload failed:', error);
      return;
    }
    
    const result = await uploadRes.json();
    console.log('✅ Import started!');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Total items: ${result.totalItems}`);
    console.log(`   Status: ${result.status}`);
    
    // Poll for status
    await pollImportStatus(result.jobId, cookies2.join('; '));
    
  } else {
    console.log('✓ Logged in successfully');
    
    // Upload with session
    console.log('📤 Uploading ZIP file to /api/import/upload...');
    const uploadRes = await fetch('http://localhost:5000/api/import/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Cookie': cookies.join('; ')
      }
    });
    
    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      console.error('❌ Upload failed:', error);
      return;
    }
    
    const result = await uploadRes.json();
    console.log('✅ Import started!');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Total items: ${result.totalItems}`);
    console.log(`   Status: ${result.status}`);
    
    // Poll for status
    await pollImportStatus(result.jobId, cookies.join('; '));
  }
}

async function pollImportStatus(jobId, cookie) {
  console.log('\n📊 Monitoring import progress...\n');
  
  let lastProgress = -1;
  let attempts = 0;
  const maxAttempts = 60; // 1 minute max
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusRes = await fetch(`http://localhost:5000/api/import/status/${jobId}`, {
      headers: { 'Cookie': cookie }
    });
    
    if (!statusRes.ok) {
      console.error('❌ Failed to get status');
      break;
    }
    
    const job = await statusRes.json();
    
    if (job.progress !== lastProgress) {
      console.log(`   Progress: ${job.progress}% (${job.processedItems}/${job.totalItems} items)`);
      lastProgress = job.progress;
    }
    
    if (job.status === 'completed') {
      console.log('\n✅ Import completed successfully!');
      console.log(`   Imported: ${job.processedItems} items`);
      if (job.metadata?.imported?.length) {
        console.log(`   Created ${job.metadata.imported.length} content items`);
      }
      if (job.metadata?.skipped?.length) {
        console.log(`   Skipped: ${job.metadata.skipped.length} items`);
      }
      if (job.metadata?.failed?.length) {
        console.log(`   Failed: ${job.metadata.failed.length} items`);
      }
      break;
    }
    
    if (job.status === 'failed') {
      console.error('\n❌ Import failed:', job.errorMessage);
      break;
    }
    
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏱️ Timeout waiting for import to complete');
  }
}

doImport().catch(console.error);
