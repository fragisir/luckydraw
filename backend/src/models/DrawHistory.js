const mongoose = require('mongoose');

const drawHistorySchema = new mongoose.Schema({
  drawId: {
    type: String,
    required: true,
    unique: true
  },
  drawName: {
    type: String,
    required: true
  },
  drawDateTime: {
    type: Date,
    required: true
  },
  totalTickets: {
    type: Number,
    required: true
  },
  winningTicketNumber: {
    type: String,
    required: true
  },
  winningNumbers: {
    type: [Number],
    required: true
  },
  randomSeed: {
    type: String,
    required: true
  },
  hashProof: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAWN'],
    default: 'DRAWN'
  },
  // Algorithm details for transparency
  algorithmUsed: {
    type: String,
    default: 'Fisher-Yates Shuffle with crypto.randomBytes'
  }
}, {
  timestamps: true
});

// Index for quick lookups
drawHistorySchema.index({ drawId: 1 });
drawHistorySchema.index({ drawDateTime: -1 });

module.exports = mongoose.model('DrawHistory', drawHistorySchema);
