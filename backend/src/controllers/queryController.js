const db = require('../config/database');

const queryController = {
  async executeQuery(req, res, next) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ 
          success: false, 
          message: 'Query is required' 
        });
      }

      // Security: Only allow SELECT queries and PRAGMA commands
      const trimmedQuery = query.trim().toLowerCase();
      const allowedCommands = ['select', 'pragma'];
      const isAllowed = allowedCommands.some(cmd => trimmedQuery.startsWith(cmd));

      if (!isAllowed) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only SELECT queries and PRAGMA commands are allowed for security reasons',
          allowedCommands: allowedCommands
        });
      }

      // Execute the query
      db.all(query, [], (err, rows) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: 'Query execution failed', 
            error: err.message 
          });
        }

        res.json({ 
          success: true, 
          data: rows,
          rowCount: rows.length,
          query: query.substring(0, 100) + (query.length > 100 ? '...' : '') // Show first 100 chars
        });
      });
    } catch (error) {
      next(error);
    }
  },

  async getPresetQueries(req, res, next) {
    try {
      const presetQueries = {
        'Top 5 Run Scorers': 'SELECT p.name, t.name as team, p.runs FROM players p LEFT JOIN teams t ON p.team_id = t.id ORDER BY p.runs DESC LIMIT 5',
        'Top 5 Wicket Takers': 'SELECT p.name, t.name as team, p.wickets FROM players p LEFT JOIN teams t ON p.team_id = t.id ORDER BY p.wickets DESC LIMIT 5',
        'All-Rounders (Runs > 1000 & Wickets > 50)': 'SELECT p.name, t.name as team, p.runs, p.wickets FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE p.runs > 1000 AND p.wickets > 50 ORDER BY (p.runs + p.wickets * 20) DESC',
        'Team Win Percentages': 'SELECT name as team, wins, losses, ROUND((wins * 100.0) / (wins + losses), 2) as win_percentage FROM teams WHERE (wins + losses) > 0 ORDER BY win_percentage DESC',
        'Players by Team': 'SELECT t.name as team, COUNT(p.id) as player_count FROM teams t LEFT JOIN players p ON t.id = p.team_id GROUP BY t.id, t.name ORDER BY player_count DESC',
        'Championship Winners': 'SELECT name as team, trophies FROM teams WHERE trophies IS NOT NULL ORDER BY wins DESC',
        'Batsmen vs Bowlers Count': 'SELECT CASE WHEN role LIKE "%Batsman%" THEN "Batsman" WHEN role = "Bowler" THEN "Bowler" WHEN role = "All-Rounder" THEN "All-Rounder" ELSE "Other" END as role_type, COUNT(*) as count FROM players GROUP BY role_type',
        'High Impact Players (Runs + Wickets)': 'SELECT p.name, t.name as team, p.runs, p.wickets, (p.runs + p.wickets * 25) as impact_score FROM players p LEFT JOIN teams t ON p.team_id = t.id ORDER BY impact_score DESC LIMIT 10'
      };

      res.json({ 
        success: true, 
        data: presetQueries,
        message: 'Use these preset queries or create your own SELECT statements'
      });
    } catch (error) {
      next(error);
    }
  },

  async getQueryHelp(req, res, next) {
    try {
      const help = {
        tables: {
          teams: {
            description: 'IPL teams with their performance data',
            columns: ['id', 'name', 'wins', 'losses', 'trophies']
          },
          players: {
            description: 'IPL players with their statistics',
            columns: ['id', 'name', 'role', 'team_id', 'runs', 'wickets', 'image_url']
          }
        },
        examples: {
          'Basic Select': 'SELECT * FROM players LIMIT 5',
          'Join Tables': 'SELECT p.name, t.name as team FROM players p JOIN teams t ON p.team_id = t.id',
          'Filtering': 'SELECT * FROM players WHERE role = "Batsman" AND runs > 3000',
          'Aggregation': 'SELECT team_id, AVG(runs) as avg_runs FROM players GROUP BY team_id',
          'Ordering': 'SELECT name, runs FROM players ORDER BY runs DESC LIMIT 10'
        },
        allowedCommands: ['SELECT', 'PRAGMA'],
        restrictions: [
          'Only read operations are allowed',
          'No INSERT, UPDATE, DELETE, or DROP statements',
          'No CREATE TABLE or ALTER TABLE statements'
        ]
      };

      res.json({ 
        success: true, 
        data: help,
        message: 'Query help and examples for the IPL database'
      });
    } catch (error) {
      next(error);
    }
  },

  async getSchema(req, res, next) {
    try {
      const schema = {};
      
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, [], (err, tables) => {
        if (err) return next(err);
        
        let tablesProcessed = 0;
        
        if (tables.length === 0) {
          return res.json({ success: true, data: {} });
        }
        
        tables.forEach(table => {
          db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (err) return next(err);
            
            schema[table.name] = columns.map(col => ({
              name: col.name,
              type: col.type,
              pk: col.pk === 1
            }));
            
            tablesProcessed++;
            
            if (tablesProcessed === tables.length) {
              res.json({ success: true, data: schema });
            }
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = queryController;