const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create checkout session
router.post('/create-checkout', paymentController.createCheckoutSession);

// Stripe webhook (must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Verify payment
router.get('/verify/:sessionId', paymentController.verifyPayment);

module.exports = router;
