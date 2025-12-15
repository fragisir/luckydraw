const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  drawName: {
    type: String,
    required: true,
    default: 'Nepal Loto 6'
  },
  drawDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['OPEN', 'STOPPED', 'DRAWN'],
    default: 'OPEN'
  },
  winningTicketNumber: {
    type: String,
    default: null
  },
  winningNumbers: {
    type: [Number],
    default: []
  },
  totalTickets: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Draw', drawSchema);
