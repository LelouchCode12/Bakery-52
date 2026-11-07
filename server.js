const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx !== -1) {
                    const key = trimmed.slice(0, idx).trim();
                    const val = trimmed.slice(idx + 1).trim();
                    if (!process.env[key]) process.env[key] = val;
                }
            }
        });
    } catch (e) {}
}

const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

/* ============================================================================================================ */
function processStripePayment(order) {
    if (!STRIPE_SECRET_KEY) {
        return Promise.resolve({ success: false, skipped: true });
    }
    return new Promise((resolve) => {
        const amountUsdCents = Math.max(50, Math.round(((order.total || 0) / 500) * 100));

        const postData = new URLSearchParams({
            amount: amountUsdCents.toString(),
            currency: 'usd',
            description: `Bakery-52 Order #${order.id} (${order.customer})`,
            payment_method: 'pm_card_visa',
            confirm: 'true',
            'automatic_payment_methods[enabled]': 'true',
            'automatic_payment_methods[allow_redirects]': 'never',
            'metadata[order_id]': String(order.id),
            'metadata[customer]': String(order.customer),
            'metadata[amount_kzt]': `${order.total}₸`,
            'metadata[payment_method]': String(order.method)
        }).toString();

        const req = https.request({
            hostname: 'api.stripe.com',
            port: 443,
            path: '/v1/payment_intents',
            method: 'POST',
            family: 4,
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            success: true,
                            id: parsed.id,
                            status: parsed.status,
                            url: `https://dashboard.stripe.com/test/payments/${parsed.id}`
                        });
                    } else {
                        console.warn('[Stripe API Warning]:', parsed.error ? parsed.error.message : body);
                        resolve({ success: false, error: parsed.error ? parsed.error.message : 'Stripe error' });
                    }
                } catch (e) {
                    resolve({ success: false, error: 'Failed to parse response' });
                }
            });
        });

        req.on('error', (err) => {
            console.warn('[Stripe Network Warning]:', err.message);
            resolve({ success: false, error: err.message, offline: true });
        });

        req.setTimeout(20000, () => {
            console.warn('[Stripe Timeout]: Request took longer than 20s');
            req.destroy();
            resolve({ success: false, error: 'Timeout', offline: true });
        });

        req.write(postData);
        req.end();
    });
}

/* ============================================================================================================ */
let orderQueue = Promise.resolve();
function saveOrderSafely(order) {
    orderQueue = orderQueue.then(() => {
        try {
            const currentOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]');
            currentOrders.unshift(order);
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(currentOrders, null, 2), 'utf8');
        } catch (err) {
            console.error('[Error saving order]:', err);
        }
    });
    return orderQueue;
}

/* ============================================================================================================ */
const server = http.createServer((req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/checkout') {
        let rawBody = '';
        let bodyLength = 0;
        const MAX_BODY_SIZE = 1e6;
        let isDestroyed = false;

        req.on('data', chunk => {
            bodyLength += chunk.length;
            if (bodyLength > MAX_BODY_SIZE) {
                isDestroyed = true;
                req.destroy();
                res.writeHead(413, headers);
                res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
                return;
            }
            rawBody += chunk;
        });

        req.on('end', async () => {
            if (isDestroyed) return;
            try {
                let data = {};
                try {
                    data = JSON.parse(rawBody || '{}');
                } catch (err) {
                    res.writeHead(400, headers);
                    res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                    return;
                }

                const total = Number(data.total);
                if (!total || isNaN(total) || total <= 0) {
                    res.writeHead(400, headers);
                    res.end(JSON.stringify({ success: false, error: 'Invalid order amount' }));
                    return;
                }

                const customerName = (typeof data.cardHolder === 'string' && data.cardHolder.trim())
                    ? data.cardHolder.trim()
                    : (data.method === 'Apple Pay' ? 'Apple Pay User' : 'Customer');

                const paymentMethod = typeof data.method === 'string' && data.method.trim()
                    ? data.method.trim()
                    : 'Bank Card';

                const cardLast4 = typeof data.cardLast4 === 'string' && data.cardLast4.trim()
                    ? data.cardLast4.trim().slice(-4)
                    : (paymentMethod === 'Apple Pay' ? '8842' : '—');

                const orderId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
                const newOrder = {
                    id: orderId,
                    date: new Date().toLocaleString('ru-RU'),
                    customer: customerName,
                    method: paymentMethod,
                    cardLast4: cardLast4,
                    total: total,
                    items: (data.items && typeof data.items === 'object') ? data.items : {}
                };

                let stripeStatusMsg = 'Payment approved';
                if (STRIPE_SECRET_KEY) {
                    const stripeResult = await processStripePayment(newOrder);
                    if (stripeResult.success) {
                        newOrder.stripePaymentId = stripeResult.id;
                        newOrder.stripeDashboardUrl = stripeResult.url;
                        stripeStatusMsg = 'Payment approved by Stripe';
                        console.log(`[Stripe API] Transaction confirmed: ${stripeResult.id}`);
                        console.log(`  🔗 View in Stripe Dashboard: ${stripeResult.url}`);
                    } else if (!stripeResult.offline) {
                        res.writeHead(400, headers);
                        res.end(JSON.stringify({
                            success: false,
                            error: stripeResult.error || 'Payment failed in Stripe'
                        }));
                        return;
                    } else {
                        stripeStatusMsg = 'Payment approved (Offline Fallback)';
                    }
                } else {
                    stripeStatusMsg = 'Payment approved (Mock Mode)';
                }

                await saveOrderSafely(newOrder);

                console.log(`[Order Approved] #${orderId} - ${total.toLocaleString('ru-RU')}₸ | ${newOrder.method} | ${newOrder.customer}`);

                res.writeHead(200, headers);
                res.end(JSON.stringify({
                    success: true,
                    orderId: orderId,
                    total: total,
                    method: newOrder.method,
                    customer: newOrder.customer,
                    stripeId: newOrder.stripePaymentId || null,
                    message: stripeStatusMsg
                }));
            } catch (err) {
                console.error('[Unhandled Server Error]:', err);
                if (!res.headersSent) {
                    res.writeHead(500, headers);
                    res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
                }
            }
        });
        return;
    }

    if (req.method === 'GET' && req.url === '/api/orders') {
        try {
            const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]');
            res.writeHead(200, headers);
            res.end(JSON.stringify(orders, null, 2));
        } catch (err) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ success: false, error: 'Failed to read orders' }));
        }
        return;
    }

    res.writeHead(404, headers);
    res.end(JSON.stringify({ error: 'Route not found' }));
});

/* ============================================================================================================ */
server.listen(PORT, () => {
    console.log(`Bakery-52 Payment Server running on http://localhost:${PORT}`);
    if (STRIPE_SECRET_KEY) {
        console.log(`Stripe API: Connected (Test Mode)`);
    } else {
        console.log(`Mode: Standalone / Mock (Ready for payments)`);
    }
    console.log(`Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/api/checkout`);
    console.log(`  GET  http://localhost:${PORT}/api/orders`);
    console.log(`Ready for payments! Press Ctrl+C to stop.`);
});

