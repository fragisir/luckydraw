const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');

// Draw Management
router.post('/start-draw', drawController.startSales);
router.post('/stop-draw', drawController.stopSales);
router.post('/create-draw', drawController.createDraw);
router.get('/draws', drawController.getAllDraws);

// Run Draw
router.post('/run-draw', drawController.runDraw); // Deprecated generic run
router.post('/run-draw/:drawId', drawController.runDraw); // Specific run

// Status & Analytics
router.get('/status', drawController.getDrawStatus);
router.get('/analytics/:drawId', drawController.getDrawAnalytics);

module.exports = router;
