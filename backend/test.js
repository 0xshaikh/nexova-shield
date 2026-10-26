#!/usr/bin/env node

/**
 * ShieldSeek - API Test Script
 * Test all backend endpoints
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testEndpoint(method, path, body = null) {
    const url = `${BASE_URL}${path}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log(`\n${method} ${path}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);

        return { success: response.ok, data };
    } catch (error) {
        console.log(`\n${method} ${path}`);
        console.log(`ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('=== ShieldSeek API Tests ===');
    console.log(`Base URL: ${BASE_URL}`);

    let passed = 0;
    let failed = 0;

    // Test 1: Health Check
    console.log('\n--- Test 1: Health Check ---');
    const health = await testEndpoint('GET', '/api/health');
    if (health.success && health.data.status === 'ok') {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 2: Scan Valid URL
    console.log('\n--- Test 2: Scan Valid URL ---');
    const scan = await testEndpoint('POST', '/api/scan', { url: 'https://example.com' });
    if (scan.success && scan.data.url === 'https://example.com') {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 3: Scan Invalid URL
    console.log('\n--- Test 3: Scan Invalid URL ---');
    const invalidScan = await testEndpoint('POST', '/api/scan', { url: 'invalid' });
    if (!invalidScan.success || invalidScan.data.error === 'Valid URL required') {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 4: Threat Intelligence
    console.log('\n--- Test 4: Threat Intelligence ---');
    const threats = await testEndpoint('GET', '/api/threats/intelligence');
    if (threats.success && threats.data.activeThreats > 0) {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 5: Protection Status
    console.log('\n--- Test 5: Protection Status ---');
    const status = await testEndpoint('GET', '/api/protection/status');
    if (status.success && status.data.shield === 'active') {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 6: Create API Key
    console.log('\n--- Test 6: Create API Key ---');
    const createKey = await testEndpoint('POST', '/api/keys/create');
    if (createKey.success && createKey.data.key) {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Test 7: List API Keys
    console.log('\n--- Test 7: List API Keys ---');
    const listKeys = await testEndpoint('GET', '/api/keys/list');
    if (listKeys.success && listKeys.data.keys) {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        failed++;
    }

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}/${passed + failed}`);
    console.log(`Failed: ${failed}/${passed + failed}`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
