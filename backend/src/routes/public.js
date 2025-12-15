const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');

// Get all draw history (public)
router.get('/draws', drawController.getDrawHistory);

// Get specific draw details (public)
router.get('/draws/:drawId', drawController.getDrawDetails);

// Get current active draw status
router.get('/status', drawController.getDrawStatus);

module.exports = router;
