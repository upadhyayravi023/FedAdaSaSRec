// Node.js 18+ has built in fetch. Using native fetch.

const BASE_URL = 'http://localhost:3000';

async function testFlow() {
  console.log('🚀 Starting Manual Flow Test...\n');
  let jwtToken = '';
  let tenantId = '';
  let apiKey = '';

  // 0. Dashboard Register
  try {
    console.log('▶️ [Dashboard] Testing Register (Expected: SUCCESS or 400 if exists)');
    const res = await fetch(`${BASE_URL}/api/dashboard/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Test Inc', email: 'admin@test.com', password: 'password123' })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Dashboard Register successful');
      jwtToken = data.token;
      tenantId = data.profile.id;
    } else if (res.status === 400) {
      console.log('⚠️ Tenant already exists (expected on subsequent runs)');
    } else {
      console.error('❌ Register failed:', data);
    }
  } catch (err) {
    console.error('❌ Register error:', err.message);
  }

  // 1. Dashboard Login
  try {
    console.log('\n▶️ [Dashboard] Testing Login...');
    const res = await fetch(`${BASE_URL}/api/dashboard/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Dashboard Login successful');
      jwtToken = data.token;
      tenantId = data.profile.id;
    } else {
      console.error('❌ Login failed:', data);
    }
  } catch (err) {
    console.error('❌ Login error:', err.message);
  }

  // 2. Generate SDK API Key
  try {
    console.log('\n▶️ [Dashboard] Testing SDK API Key Generation...');
    const res = await fetch(`${BASE_URL}/api/dashboard/keys/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ API Key generated:', data.apiKey);
      apiKey = data.apiKey;
    } else {
      console.error('❌ API Key Generation failed:', data);
    }
  } catch (err) {
    console.error('❌ API Key error:', err.message);
  }

  // 3. Get Dashboard Metrics
  try {
    console.log('\n▶️ [Dashboard] Testing Get Metrics...');
    const res = await fetch(`${BASE_URL}/api/dashboard/metrics`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Dashboard Metrics retrieved:', data);
    } else {
      console.error('❌ Get Metrics failed:', data);
    }
  } catch (err) {
    console.error('❌ Metrics error:', err.message);
  }

  // 4. Catalog Sync (Upload)
  try {
    console.log('\n▶️ [Catalog Sync] Testing Catalog Upload...');
    const res = await fetch(`${BASE_URL}/api/catalog/upload`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify([
        { sku: 'ITEM-1', title: 'Test Item 1' },
      ])
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Catalog Upload successful:', data);
    } else {
      console.error('❌ Catalog Upload failed:', data);
    }
  } catch (err) {
    console.error('❌ Catalog error:', err.message);
  }

  // 5. Catalog Sync (Publish Map)
  try {
    console.log('\n▶️ [Catalog Sync] Testing Publish Translation Map...');
    const res = await fetch(`${BASE_URL}/api/catalog/publish`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Map Published successful:', data);
    } else {
      console.error('❌ Publish Map failed:', data);
    }
  } catch (err) {
    console.error('❌ Catalog Publish error:', err.message);
  }

  // 6. SDK Upload Gradient
  try {
    console.log('\n▶️ [SDK] Testing Gradient Upload URL generation...');
    const res = await fetch(`${BASE_URL}/api/sdk/gradients/upload`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ deviceId: 'device-xyz-123', clickCount: 5 })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ SDK Upload generated successfully:', data);
    } else {
      console.error('❌ SDK Upload failed:', data);
    }
  } catch (err) {
    console.error('❌ SDK Gradients Upload error:', err.message);
  }

  // 7. ML Engine (Internal Route - Trigger)
  try {
    console.log('\n▶️ [ML Engine] Testing Internal Aggregation trigger...');
    const res = await fetch(`${BASE_URL}/internal/ml/trigger-aggregation`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-secret': 'dev_internal_secret' // Needs to match internalOnly.js
      },
      body: JSON.stringify({ tenantId: tenantId })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ ML Aggregation trigger successful:', data);
    } else {
      console.error('❌ ML trigger failed:', data);
    }
  } catch (err) {
    console.error('❌ ML API error:', err.message);
  }

  // 8. ML Engine (Internal Route - Webhook Model Ready)
  try {
    console.log('\n▶️ [ML Engine] Testing Webhook Model Ready...');
    const res = await fetch(`${BASE_URL}/internal/ml/webhook-model-ready`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-secret': 'dev_internal_secret'
      },
      body: JSON.stringify({
        tenantId: tenantId,
        newModelVersion: 'v2.0',
        newOnnxS3Url: 's3://bucket/test.onnx'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Webhook Model Ready successful:', data);
    } else {
      console.error('❌ Webhook Model Ready failed:', data);
    }
  } catch (err) {
    console.error('❌ ML Webhook error:', err.message);
  }

  // 9. SDK Model Latest
  try {
    console.log('\n▶️ [SDK] Testing Latest Model Fetch...');
    const res = await fetch(`${BASE_URL}/api/sdk/model/latest`, {
      method: 'GET',
      headers: { 
        'x-api-key': apiKey
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ SDK Model details generated:', data);
    } else {
      console.error('❌ SDK Model Fetch failed:', data);
    }
  } catch (err) {
    console.error('❌ SDK Model Fetch error:', err.message);
  }

  // 10. SDK Telemetry
  try {
    console.log('\n▶️ [SDK] Testing Telemetry recording...');
    const res = await fetch(`${BASE_URL}/api/sdk/telemetry`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ deviceId: 'device-xyz-123', recommendationsServed: 12 })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Telemetry recorded successfully:', data);
    } else {
      console.error('❌ Telemetry recording failed:', data);
    }
  } catch (err) {
    console.error('❌ Telemetry error:', err.message);
  }

  console.log('\n🏁 Flow test finished.');
}

testFlow();
