const Player = require('../models/Player');
const Team = require('../models/Team');
const db = require('../config/database');

const statsController = {
  async getBatsmen(req, res, next) {
    try {
      const batsmen = await Player.getTopBatsmen();
      res.json({ success: true, data: batsmen });
    } catch (error) {
      next(error);
    }
  },

  async getBowlers(req, res, next) {
    try {
      const bowlers = await Player.getTopBowlers();
      res.json({ success: true, data: bowlers });
    } catch (error) {
      next(error);
    }
  },

  async getTeams(req, res, next) {
    try {
      const teams = await Team.getRankings();
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  async getDashboard(req, res, next) {
    try {
      const [topBatsmen, topBowlers, topTeams] = await Promise.all([
        Player.getTopBatsmen(),
        Player.getTopBowlers(),
        Team.getRankings()
      ]);

      const stats = {
        topBatsman: topBatsmen[0] || null,
        topBowler: topBowlers[0] || null,
        topTeam: topTeams[0] || null
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getRoles(req, res, next) {
    try {
      db.all('SELECT DISTINCT role FROM players WHERE role IS NOT NULL', [], (err, rows) => {
        if (err) return next(err);
        res.json({ success: true, data: rows });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = statsController;