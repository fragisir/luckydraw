const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Search ticket by ticket number
router.get('/search/:ticketNumber', ticketController.searchTicket);

// Get all tickets (admin)
router.get('/', ticketController.getAllTickets);

// Get ticket statistics
router.get('/stats', ticketController.getTicketStats);

module.exports = router;
