const db = require('../config/database');

class Player {
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.id, p.name, p.role, t.name AS team, p.runs, p.wickets, p.image_url
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        ORDER BY p.name
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.id, p.name, p.role, t.name AS team, p.runs, p.wickets, p.image_url
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(playerData) {
    return new Promise((resolve, reject) => {
      const { name, role, team_id, runs = 0, wickets = 0, image_url } = playerData;
      const query = `
        INSERT INTO players (name, role, team_id, runs, wickets, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [name, role, team_id || null, runs, wickets, image_url || null], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...playerData });
      });
    });
  }

  static update(id, playerData) {
    return new Promise((resolve, reject) => {
      Player.getById(id).then(player => {
        if (!player) {
          reject(new Error('Player not found'));
          return;
        }

        const { name, role, team_id, runs, wickets, image_url } = playerData;
        const query = `
          UPDATE players
          SET name = ?, role = ?, team_id = ?, runs = ?, wickets = ?, image_url = ?
          WHERE id = ?
        `;

        db.run(query, [
          name || player.name,
          role || player.role,
          team_id !== undefined ? team_id : player.team_id,
          runs !== undefined ? runs : player.runs,
          wickets !== undefined ? wickets : player.wickets,
          image_url !== undefined ? image_url : player.image_url,
          id
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      }).catch(reject);
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM players WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  static getTopBatsmen() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.id, p.name, t.name as team, p.role, p.runs, p.image_url
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.runs > 0
        ORDER BY p.runs DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getTopBowlers() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.id, p.name, t.name as team, p.role, p.wickets, p.image_url
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.wickets > 0
        ORDER BY p.wickets DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Player;