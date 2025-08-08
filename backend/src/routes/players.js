const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/', playerController.getAll);
router.get('/:id', playerController.getById);
router.post('/', playerController.create);
router.put('/:id', playerController.update);
router.delete('/:id', playerController.delete);

module.exports = router;