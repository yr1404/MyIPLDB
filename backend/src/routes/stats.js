const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/batsmen', statsController.getBatsmen);
router.get('/bowlers', statsController.getBowlers);
router.get('/teams', statsController.getTeams);
router.get('/dashboard', statsController.getDashboard);
router.get('/roles', statsController.getRoles);

module.exports = router;