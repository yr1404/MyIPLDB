const db = require('../config/database');

class Team {
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name as team, wins, losses, trophies FROM teams ORDER BY wins DESC';
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name as team, wins, losses, trophies FROM teams WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(name) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO teams (name) VALUES (?)';
      
      db.run(query, [name], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name });
      });
    });
  }

  static update(id, teamData) {
    return new Promise((resolve, reject) => {
      Team.getById(id).then(team => {
        if (!team) {
          reject(new Error('Team not found'));
          return;
        }

        const { name, wins, losses, trophies } = teamData;
        const query = 'UPDATE teams SET name = ?, wins = ?, losses = ?, trophies = ? WHERE id = ?';
        
        db.run(query, [
          name || team.team,
          wins !== undefined ? wins : team.wins,
          losses !== undefined ? losses : team.losses,
          trophies !== undefined ? trophies : team.trophies,
          id
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      }).catch(reject);
    });
  }

  static getRankings() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name as team, wins, losses, 
               (wins * 2) as points,
               CASE 
                 WHEN (wins + losses) > 0 THEN ROUND((wins * 100.0) / (wins + losses), 1)
                 ELSE 0 
               END as win_percentage,
               trophies
        FROM teams
        ORDER BY points DESC, win_percentage DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Team;