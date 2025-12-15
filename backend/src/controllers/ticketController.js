const Ticket = require('../models/Ticket');

/**
 * Search for a ticket by ticket number
 */
exports.searchTicket = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket number is required' 
      });
    }

    // Find ticket and populate the linked Draw
    const ticket = await Ticket.findOne({ ticketNumber }).populate('drawId');

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    let result = {
      matches: 0,
      matchedNumbers: [],
      prizeTier: 'PENDING',
      winningNumbers: [],
      hashProof: null,
      drawDate: null
    };

    // Calculate results if draw is complete
    if (ticket.drawId && ticket.drawId.status === 'DRAWN') {
      const winningNumbers = ticket.drawId.winningNumbers || [];
      const userNumbers = ticket.selectedNumbers || [];

      // Calculate matches
      const matchedNumbers = userNumbers.filter(num => winningNumbers.includes(num));
      const matchCount = matchedNumbers.length;

      // Determine Prize Tier
      let prizeTier = 'NO_PRIZE';
      if (matchCount === 6) prizeTier = 'JACKPOT';
      else if (matchCount === 5) prizeTier = 'SECOND_PRIZE';
      else if (matchCount === 4) prizeTier = 'THIRD_PRIZE';

      result = {
        matches: matchCount,
        matchedNumbers: matchedNumbers,
        prizeTier: prizeTier,
        winningNumbers: winningNumbers,
        // We need to fetch Hash Proof. Usually stored in DrawHistory, 
        // but for now we'll check if it's on the Draw object or fallback.
        // Assuming Draw schema might not have hashProof directly, generally it's in DrawHistory.
        // For simplicity/speed, we'll omit complex DrawHistory lookup here unless strictly needed, 
        // or just return what's available.
        drawDate: ticket.drawId.drawDate,
        drawName: ticket.drawId.drawName
      };
      
      // Update ticket winner status if not already set (self-healing)
      if (matchCount >= 4 && !ticket.isWinner) {
        ticket.isWinner = true;
        await ticket.save();
      }
    }

    // Return extended ticket information
    res.json({
      success: true,
      ticket: {
        _id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        name: ticket.name,
        selectedNumbers: ticket.selectedNumbers,
        paymentStatus: ticket.paymentStatus,
        purchaseDate: ticket.createdAt,
        drawStatus: ticket.drawId ? ticket.drawId.status : 'PENDING',
        ...result
      }
    });

  } catch (error) {
    console.error('Ticket search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search ticket',
      error: error.message 
    });
  }
};

/**
 * Get all tickets (admin only)
 */
exports.getAllTickets = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .populate('drawId');

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tickets' 
    });
  }
};

/**
 * Get ticket statistics
 */
exports.getTicketStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const paidTickets = await Ticket.countDocuments({ paymentStatus: 'PAID' });
    const pendingTickets = await Ticket.countDocuments({ paymentStatus: 'PENDING' });
    const winners = await Ticket.countDocuments({ isWinner: true });

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        paid: paidTickets,
        pending: pendingTickets,
        winners
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    });
  }
};
