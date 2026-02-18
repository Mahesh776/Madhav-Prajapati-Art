const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay key
    key_secret: 'YOUR_KEY_SECRET' // Replace with your Razorpay secret
});

// Create order endpoint
app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'receipt_' + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// Verify payment endpoint
app.post('/verify-payment', (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;
        
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', 'YOUR_KEY_SECRET')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === signature) {
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Error verifying payment' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});