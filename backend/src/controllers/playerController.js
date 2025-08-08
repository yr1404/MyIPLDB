const Player = require('../models/Player');
const { validatePlayer } = require('../utils/validation');

const playerController = {
  async getAll(req, res, next) {
    try {
      const players = await Player.getAll();
      res.json({ success: true, data: players });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const player = await Player.getById(req.params.id);
      if (!player) {
        return res.status(404).json({ success: false, message: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const validation = validatePlayer(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const player = await Player.create(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Player created successfully', 
        data: player 
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      await Player.update(req.params.id, req.body);
      res.json({ success: true, message: 'Player updated successfully' });
    } catch (error) {
      if (error.message === 'Player not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await Player.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Player not found' });
      }
      res.json({ success: true, message: 'Player deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = playerController;