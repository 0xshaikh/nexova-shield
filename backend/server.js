// NEXOVA Shield Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://0xshaikh.github.io', 'http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// ============ AI THREAT DETECTION ENGINE ============

// Sample threat database (in production, this would be ML-powered)
const THREAT_SIGNATURES = [
    { pattern: /eval\s*\(/i, type: 'Code Injection', severity: 'HIGH' },
    { pattern: /exec\s*\(/i, type: 'Command Injection', severity: 'HIGH' },
    { pattern: /<script/i, type: 'XSS Attempt', severity: 'MEDIUM' },
    { pattern: /UNION.*SELECT/i, type: 'SQL Injection', severity: 'HIGH' },
    { pattern: /\.\.\/|\/\.\./i, type: 'Directory Traversal', severity: 'HIGH' },
    { pattern: /base64_decode/i, type: 'Encoded Payload', severity: 'MEDIUM' },
    { pattern: /system\s*\(/i, type: 'System Command', severity: 'HIGH' },
    { pattern: /passthru\s*\(/i, type: 'System Command', severity: 'HIGH' },
    { pattern: /shell_exec\s*\(/i, type: 'Command Injection', severity: 'HIGH' },
    { pattern: /php:\/\/input/i, type: 'PHP Wrapper Abuse', severity: 'HIGH' },
];

// Scan URL function
async function scanURL(url) {
    const results = {
        url: url,
        scannedAt: new Date().toISOString(),
        threats: [],
        score: 100,
        status: 'safe'
    };

    try {
        // Fetch URL content
        const response = await fetch(url);
        const html = await response.text();

        // Check for security headers
        const securityChecks = {
            hasCSP: !!response.headers.get('content-security-policy'),
            hasHSTS: !!response.headers.get('strict-transport-security'),
            hasXFrame: !!response.headers.get('x-frame-options'),
            hasXSSProtection: !!response.headers.get('x-xss-protection'),
            hasCacheControl: !!response.headers.get('cache-control')
        };

        // Scan for threat signatures
        THREAT_SIGNATURES.forEach(sig => {
            if (sig.pattern.test(html)) {
                results.threats.push({
                    type: sig.type,
                    severity: sig.severity,
                    pattern: sig.pattern.toString()
                });
            }
        });

        // Check for exposed sensitive info
        if (/\.env|\.git|config\.php/i.test(html)) {
            results.threats.push({
                type: 'Exposed Sensitive Files',
                severity: 'HIGH'
            });
        }

        // Check for outdated software
        if (/WordPress|Joomla|Drupal/i.test(html)) {
            results.threats.push({
                type: 'CMS Detected',
                severity: 'INFO',
                recommendation: 'Ensure CMS is updated to latest version'
            });
        }

        // Calculate security score
        results.score = Math.max(0, 100 - (results.threats.length * 15));
        results.status = results.threats.length > 0 ? 'warning' : 'safe';
        results.securityChecks = securityChecks;

        // Add recommendations
        results.recommendations = generateRecommendations(results);

    } catch (error) {
        results.status = 'error';
        results.error = error.message;
    }

    return results;
}

// Generate security recommendations
function generateRecommendations(scanResult) {
    const recs = [];

    if (!scanResult.securityChecks?.hasCSP) {
        recs.push('Add Content-Security-Policy header');
    }
    if (!scanResult.securityChecks?.hasHSTS) {
        recs.push('Enable HTTP Strict Transportation Security');
    }
    if (!scanResult.securityChecks?.hasXFrame) {
        recs.push('Add X-Frame-Options header');
    }
    if (scanResult.threats.some(t => t.type === 'XSS Attempt')) {
        recs.push('Sanitize all user inputs and outputs');
    }
    if (scanResult.threats.some(t => t.type === 'SQL Injection')) {
        recs.push('Use prepared statements for all database queries');
    }
    if (scanResult.threats.some(t => t.type === 'Exposed Sensitive Files')) {
        recs.push('Block access to sensitive files (.env, .git, config)');
    }

    return recs;
}

// ============ API ROUTES ============

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        engine: 'ShieldSeek AI Engine',
        timestamp: new Date().toISOString()
    });
});

// Scan URL endpoint
app.post('/api/scan', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Valid URL required' });
    }

    try {
        const result = await scanURL(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Scan failed', details: error.message });
    }
});

// Get threat intelligence
app.get('/api/threats/intelligence', (req, res) => {
    res.json({
        activeThreats: 2847,
        blockedToday: 12854,
        topAttacks: [
            { type: 'SQL Injection', count: 4521, trend: '+12%' },
            { type: 'XSS', count: 3287, trend: '-5%' },
            { type: 'Brute Force', count: 2156, trend: '+8%' },
            { type: 'DDoS', count: 1893, trend: '+22%' },
            { type: 'Bot Traffic', count: 1567, trend: '+15%' }
        ],
        threatLevel: 'ELEVATED',
        lastUpdated: new Date().toISOString()
    });
});

// Get protection status
app.get('/api/protection/status', (req, res) => {
    res.json({
        shield: 'active',
        lastScanned: new Date().toISOString(),
        threatsBlocked: 24856,
        vulnerabilitiesFixed: 1247,
        uptime: '99.99%',
        responseTime: 45,
        nextScan: new Date(Date.now() + 3600000).toISOString()
    });
});

// API Key management
const apiKeys = new Map();

app.post('/api/keys/create', (req, res) => {
    const key = 'nexova_' + Math.random().toString(36).substr(2, 32);
    const now = Date.now();
    apiKeys.set(key, {
        created: now,
        lastUsed: now,
        requests: 0,
        limit: 10000,
        status: 'active'
    });
    res.json({ key: key, created: new Date(now).toISOString() });
});

app.get('/api/keys/list', (req, res) => {
    const keys = Array.from(apiKeys.entries()).map(([key, data]) => ({
        key: key.substring(0, 10) + '...',
        created: new Date(data.created).toISOString(),
        lastUsed: new Date(data.lastUsed).toISOString(),
        requests: data.requests,
        limit: data.limit,
        status: data.status
    }));
    res.json({ keys: keys, total: keys.length });
});

// ============ STATIC FILE SERVING ============
app.use(express.static('../frontend'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log('=== NEXOVA Shield Backend ===');
    console.log(`Server running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log('AI Engine: Initialized');
    console.log('Threat Signatures: Loaded');
});

module.exports = app;
