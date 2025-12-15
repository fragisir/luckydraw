const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  selectedNumbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(numbers) {
        // Must have exactly 6 numbers
        if (numbers.length !== 6) return false;
        // All numbers must be between 1 and 20
        if (numbers.some(num => num < 1 || num > 20)) return false;
        // All numbers must be unique
        if (new Set(numbers).size !== numbers.length) return false;
        return true;
      },
      message: 'Must select exactly 6 unique numbers between 1 and 20'
    }
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PENDING'
  },
  stripeSessionId: {
    type: String
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  drawId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    default: null
  },
  ticketPrice: {
    type: Number,
    required: true,
    default: 500 // NPR 500
  }
}, {
  timestamps: true
});

// Generate unique ticket number before saving
// Ticket number will be generated in the controller
// No pre-save or pre-validate hooks needed for number generation anymore

module.exports = mongoose.model('Ticket', ticketSchema);
