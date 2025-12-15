const Stripe = require('stripe');
const Ticket = require('../models/Ticket');
const { generatePDFTicket, sendTicketEmail } = require('../utils/email');

/**
 * Create Stripe checkout session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { name, email, selectedNumbers } = req.body;

    // Validation
    if (!name || !email || !selectedNumbers) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and selected numbers are required' 
      });
    }

    // Validate selected numbers
    if (!Array.isArray(selectedNumbers) || selectedNumbers.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must select exactly 6 numbers' 
      });
    }

    // Check if all numbers are between 1 and 20
    if (selectedNumbers.some(num => num < 1 || num > 20)) {
      return res.status(400).json({ 
        success: false, 
        message: 'All numbers must be between 1 and 20' 
      });
    }

    // Check for duplicates
    if (new Set(selectedNumbers).size !== selectedNumbers.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Numbers cannot repeat' 
      });
    }

    // Generate Ticket Number explicitly
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const generatedTicketNumber = `NPL6-${year}-${randomNum}`;

    // Find the next open draw
    const Draw = require('../models/Draw');
    const nextDraw = await Draw.findOne({ status: 'OPEN' }).sort({ createdAt: 1 });

    if (!nextDraw) {
      return res.status(409).json({ 
        success: false, 
        message: 'Ticket sales are currently paused. Please wait for the next draw to open.' 
      });
    }

    // Create ticket in database (PENDING status)
    const ticket = new Ticket({
      ticketNumber: generatedTicketNumber,
      name,
      email,
      selectedNumbers,
      paymentStatus: 'PENDING',
      ticketPrice: 500, // NPR 500 (approx $4 USD)
      drawId: nextDraw._id // Link to specific draw
    });

    await ticket.save();

    // --- CHECK FOR MOCK MODE ---
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    // If key is missing, empty, or placeholder, use Mock Mode
    const isMockMode = !stripeKey || stripeKey.trim() === '' || stripeKey.includes('your_stripe') || stripeKey.includes('pk_test');

    if (isMockMode) {
      console.log('⚠️ Stripe Key missing/invalid - Running in MOCK MODE for ticket:', ticket.ticketNumber);
      
      // Auto-confirm logic for testing
      ticket.paymentStatus = 'PAID';
      ticket.stripeSessionId = `mock_session_${Date.now()}`;
      await ticket.save();

      // Return a URL that redirects to a mock Stripe checkout page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.json({ 
        success: true, 
        sessionId: ticket.stripeSessionId,
        sessionUrl: `${frontendUrl}/mock-checkout?ticket_number=${ticket.ticketNumber}&amount=400`,
        ticketNumber: ticket.ticketNumber
      });
    }

    // --- REAL STRIPE MODE ---
    // Only initialize Stripe if we have a valid key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Nepal Loto 6 Ticket',
              description: `Ticket: ${ticket.ticketNumber} | Numbers: ${selectedNumbers.sort((a, b) => a - b).join(', ')}`,
            },
            unit_amount: 400, // $4.00 USD (equivalent to NPR 500)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&ticket_number=${ticket.ticketNumber}`,
      cancel_url: `${process.env.FRONTEND_URL}/buy?canceled=true`,
      customer_email: email,
      metadata: {
        ticketId: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber
      }
    });

    // Save session ID to ticket
    ticket.stripeSessionId = session.id;
    await ticket.save();

    res.json({ 
      success: true, 
      sessionId: session.id,
      sessionUrl: session.url,
      ticketNumber: ticket.ticketNumber
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create checkout session',
      error: error.message 
    });
  }
};

/**
 * Handle Stripe webhook events
 */
exports.handleWebhook = async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes('your_stripe')) {
    return res.status(200).send('Mock Webhook Ignored');
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Find ticket by session ID
      const ticket = await Ticket.findOne({ stripeSessionId: session.id });
      
      if (!ticket) {
        console.error('Ticket not found for session:', session.id);
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Update ticket status to PAID
      ticket.paymentStatus = 'PAID';
      await ticket.save();

      console.log(`✅ Payment confirmed for ticket: ${ticket.ticketNumber}`);

      // Generate PDF ticket
      const pdfBuffer = await generatePDFTicket(ticket);

      // Send email with PDF ticket
      await sendTicketEmail(ticket, pdfBuffer);

      console.log(`📧 Ticket sent to ${ticket.email}`);

    } catch (error) {
      console.error('Error processing payment completion:', error);
    }
  }

  res.json({ received: true });
};

/**
 * Verify payment status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const ticket = await Ticket.findOne({ stripeSessionId: sessionId });

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    // Mock verification for mock sessions
    if (sessionId.startsWith('mock_session')) {
       return res.json({
        success: true,
        paymentStatus: 'paid',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          selectedNumbers: ticket.selectedNumbers,
          paymentStatus: ticket.paymentStatus
        }
      });
    }

    // Real verification
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      paymentStatus: session.payment_status,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        selectedNumbers: ticket.selectedNumbers,
        paymentStatus: ticket.paymentStatus
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment' 
    });
  }
};
