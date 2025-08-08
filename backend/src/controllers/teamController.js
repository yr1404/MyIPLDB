const Team = require('../models/Team');

const teamController = {
  async getAll(req, res, next) {
    try {
      const teams = await Team.getAll();
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const team = await Team.getById(req.params.id);
      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Team name is required' });
      }

      const team = await Team.create(name);
      res.status(201).json({ 
        success: true, 
        message: 'Team created successfully', 
        data: team 
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      await Team.update(req.params.id, req.body);
      res.json({ success: true, message: 'Team updated successfully' });
    } catch (error) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};

module.exports = teamController;