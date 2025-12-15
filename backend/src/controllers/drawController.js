const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Draw = require('../models/Draw');
const DrawHistory = require('../models/DrawHistory');
const { 
  generateRandomSeed, 
  generateHashProof 
} = require('../utils/crypto');
const crypto = require('crypto');

/**
 * Start Ticket Sales (Admin)
 * - If a STOPPED draw exists (not run), open it.
 * - If no active draw, create a new OPEN draw.
 */
// Helper to generate next draw name
async function getNextDrawName() {
  const count = await Draw.countDocuments();
  const nextNum = count + 1;
  return `NPL ${String(nextNum).padStart(3, '0')}`;
}

exports.startSales = async (req, res) => {
  try {
    // Check for existing active draws
    const existing = await Draw.findOne({ status: { $in: ['OPEN', 'STOPPED'] } }).sort({ createdAt: -1 });

    if (existing) {
      if (existing.status === 'OPEN') {
        return res.status(400).json({ success: false, message: 'Sales are already OPEN.' });
      }
      if (existing.status === 'STOPPED') {
        existing.status = 'OPEN';
        await existing.save();
        return res.json({ success: true, message: 'Sales resumed (OPEN).', draw: existing });
      }
    }

    // Create new Draw
    const drawName = await getNextDrawName();
    const newDraw = new Draw({
      drawName: drawName,
      drawDate: new Date(),
      status: 'OPEN'
    });
    await newDraw.save();

    res.json({ success: true, message: 'New draw started. Sales are OPEN.', draw: newDraw });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start sales', error: error.message });
  }
};

/**
 * Stop Ticket Sales
 */
exports.stopSales = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'OPEN' }).sort({ createdAt: -1 });

    if (!draw) {
      return res.status(400).json({ success: false, message: 'No OPEN draw found to stop.' });
    }

    draw.status = 'STOPPED';
    await draw.save();

    // Emit event: Sales Stopped
    const io = req.app.get('io');
    if (io) io.emit('salesStopped', { drawName: draw.drawName });

    res.json({ success: true, message: 'Sales STOPPED. You can now running the draw.', draw });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to stop sales', error: error.message });
  }
};

/**
 * Run Draw
 */
exports.runDraw = async (req, res) => {
  try {
    const { drawId } = req.params; 

    // 1. Validate Draw
    let draw;
    if (drawId) {
      draw = await Draw.findById(drawId);
    } else {
      draw = await Draw.findOne({ status: 'STOPPED' }).sort({ createdAt: 1 });
    }

    if (!draw) {
      return res.status(404).json({ success: false, message: 'No STOPPED draw found to run.' });
    }

    if (draw.status === 'OPEN') {
       return res.status(400).json({ success: false, message: 'Cannot run OPEN draw. Stop sales first.' });
    }
    if (draw.status === 'DRAWN') {
       return res.status(409).json({ success: false, message: 'Draw already finalized.' });
    }

    // 2. Fetch Participating Tickets (PAID)
    const participatingTickets = await Ticket.find({ 
      paymentStatus: 'PAID', 
      drawId: draw._id 
    });

    console.log(`🎲 Running Draw: ${draw.drawName} (${participatingTickets.length} tickets)`);

    // 3. Generate Winning Numbers (1-20, 6 unique)
    const randomSeed = generateRandomSeed();
    const winningNumbers = [];
    while (winningNumbers.length < 6) {
       // Secure random 1-20
       const n = crypto.randomInt(1, 21); // 1 to 20
       if (!winningNumbers.includes(n)) winningNumbers.push(n);
    }
    winningNumbers.sort((a,b) => a-b);

    // 4. Update Draw
    draw.status = 'DRAWN';
    draw.winningNumbers = winningNumbers;
    // winningTicketNumber concept is less relevant now with random numbers, 
    // but we can leave it null or set it to 'SYSTEM'
    draw.winningTicketNumber = 'SYSTEM-GENERATED'; 
    draw.totalTickets = participatingTickets.length;
    await draw.save();

    // 5. Generate Proof
    const drawUUID = uuidv4();
    const hashProof = generateHashProof(drawUUID, randomSeed, winningNumbers.join(','));

    // 6. Save History
    const history = new DrawHistory({
      drawId: drawUUID, // Public ID
      drawName: draw.drawName,
      drawDateTime: new Date(),
      totalTickets: participatingTickets.length,
      winningTicketNumber: 'N/A',
      winningNumbers: winningNumbers,
      randomSeed: randomSeed.substring(0, 16) + '...',
      hashProof,
      status: 'DRAWN'
    });
    await history.save();

    // Emit event: Draw Result (New!)
    const io = req.app.get('io');
    if (io) io.emit('drawResult', history);

    // 7. Update ALL Tickets with Match Results
    const updates = participatingTickets.map(async (ticket) => {
      const userNums = ticket.selectedNumbers;
      
      // Count matches
      const matches = userNums.filter(n => winningNumbers.includes(n)).length;
      
      // Prize Tiers
      // 6 -> Jackpot
      // 5 -> Medium
      // 4 -> Small
      const isWinner = matches >= 4;
      
      ticket.isWinner = isWinner;
      // You could store 'matches' count in ticket schema if you add the field.
      // For now we just mark isWinner boolean, frontend will recalc matches for display.
      return ticket.save();
    });

    await Promise.all(updates);

    res.json({
      success: true, 
      message: 'Draw completed successfully.',
      historyId: history.drawId, // Return the public UUID for redirect
      draw: {
        ...draw.toObject(),
        hashProof
      }
    });

  } catch (error) {
    console.error('Run draw error:', error);
    res.status(500).json({ success: false, message: 'Failed to run draw', error: error.message });
  }
};

/**
 * Create Manual Draw (Legacy/Admin specific)
 */
exports.createDraw = async (req, res) => {
    try {
         // Reuse logic but allow custom name
         const { drawName } = req.body;
         const existing = await Draw.findOne({ status: { $in: ['OPEN', 'STOPPED'] } });
         if (existing) return res.status(400).json({success: false, message: 'Active draw exists.'});

         const name = drawName || await getNextDrawName();
         const newDraw = new Draw({
          drawName: name,
          status: 'OPEN'
        });
        await newDraw.save();
        res.json({ success: true, message: 'Draw created and OPEN.', draw: newDraw });

    } catch(err) {
        res.status(500).json({success:false, error: err.message});
    }
};

/**
 * Get Analytics
 */
exports.getDrawAnalytics = async (req, res) => {
  try {
    const { drawId } = req.params;
    let filter = { paymentStatus: 'PAID' };
    if (drawId) filter.drawId = drawId;

    const tickets = await Ticket.find(filter);
    
    // Frequency
    const frequency = {};
    for (let i = 1; i <= 20; i++) frequency[i] = 0;
    tickets.forEach(t => t.selectedNumbers.forEach(n => frequency[n]++));
    
    const numberStats = Object.keys(frequency).map(num => ({
      number: parseInt(num),
      count: frequency[num]
    }));

    // Prize Distribution
    let prizeStats = { jackpot: 0, second: 0, third: 0, none: 0 };
    let winningNumbers = [];
    
    if (drawId) {
       const draw = await Draw.findById(drawId);
       if (draw) {
          winningNumbers = draw.winningNumbers || [];
       }
    }
    
    if (winningNumbers.length > 0) {
        tickets.forEach(t => {
           const m = t.selectedNumbers.filter(n => winningNumbers.includes(n)).length;
           if (m === 6) prizeStats.jackpot++;
           else if (m === 5) prizeStats.second++;
           else if (m === 4) prizeStats.third++;
           else prizeStats.none++;
        });
    } else {
        // If no draw yet or no winning numbers, all are 'none' (or pending)
        prizeStats.none = tickets.length;
    }

    res.json({
      success: true,
      totalTickets: tickets.length,
      winningNumbers,
      tickets: tickets.map(t => ({
          _id: t._id,
          ticketNumber: t.ticketNumber,
          name: t.name,
          email: t.email,
          selectedNumbers: t.selectedNumbers,
          createdAt: t.createdAt,
          paymentStatus: t.paymentStatus
      })),
      numberFrequency: numberStats,
      prizeDistribution: [
        { name: 'Jackpot (6/6)', value: prizeStats.jackpot, fill: '#F59E0B' },
        { name: '2nd Prize (5/6)', value: prizeStats.second, fill: '#10B981' }, 
        { name: '3rd Prize (4/6)', value: prizeStats.third, fill: '#3B82F6' },
        { name: 'No Prize', value: prizeStats.none, fill: '#CBD5E1' }
      ]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};

exports.getAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    // Live counts
    const drawsWithCounts = await Promise.all(draws.map(async (draw) => {
      const d = draw.toObject();
      if (d.status !== 'DRAWN') { // For Open OR Stopped
        d.totalTickets = await Ticket.countDocuments({ drawId: draw._id, paymentStatus: 'PAID' });
      }
      return d;
    }));
    res.json({ success: true, draws: drawsWithCounts });
  } catch (error) {
     res.status(500).json({ success: false, error: error.message });
  }
};

// Legacy Public Status
exports.getDrawStatus = async (req, res) => {
  try {
     // Return info about ANY active draw (Open or Stopped)
     const activeDraw = await Draw.findOne({ status: { $in: ['OPEN', 'STOPPED'] } }).sort({ createdAt: -1 });
     const count = activeDraw ? await Ticket.countDocuments({ paymentStatus: 'PAID', drawId: activeDraw._id }) : 0;
     
     res.json({
       success: true,
       draw: activeDraw,
       availableTickets: count,
       canBuy: activeDraw && activeDraw.status === 'OPEN'
     });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDrawHistory = async (req, res) => {
    const history = await DrawHistory.find().sort({ drawDateTime: -1 }).limit(50);
    res.json({ success: true, history });
};

exports.getDrawDetails = async (req, res) => {
  try {
    const { drawId } = req.params;
    
    // 1. Try to find in DrawHistory (by UUID drawId)
    // The param might be a UUID from history list
    let draw = await DrawHistory.findOne({ drawId: drawId });

    // 2. If not found, try to find in Draw (by MongoDB _id)
    if (!draw) {
       // Validate if it's a valid ObjectId to prevent CastError
       if (mongoose.Types.ObjectId.isValid(drawId)) {
          draw = await Draw.findById(drawId);
       }
    }

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found' });
    }

    res.json({ success: true, draw });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
