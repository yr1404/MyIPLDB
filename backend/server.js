const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'ipl_database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Initialize database with tables and sample data
db.serialize(() => {
  // Create tables if they don't exist
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    trophies TEXT DEFAULT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team_id INTEGER,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    image_url TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`);

  // Insert sample teams if none exist
  db.get("SELECT COUNT(*) as count FROM teams", [], (err, row) => {
    if (err) {
      console.error("Error checking teams:", err);
      return;
    }

    // Update sample teams data to include wins, losses, and trophies
    if (row.count === 0) {
      const teams = [
        { name: "Chennai Super Kings", wins: 121, losses: 85, trophies: "2010, 2011, 2018, 2021, 2023" },
        { name: "Delhi Capitals", wins: 93, losses: 116, trophies: null },
        { name: "Gujarat Titans", wins: 25, losses: 13, trophies: "2022" },
        { name: "Kolkata Knight Riders", wins: 113, losses: 97, trophies: "2012, 2014" },
        { name: "Lucknow Super Giants", wins: 17, losses: 13, trophies: null },
        { name: "Mumbai Indians", wins: 129, losses: 105, trophies: "2013, 2015, 2017, 2019, 2020" },
        { name: "Punjab Kings", wins: 95, losses: 115, trophies: null },
        { name: "Rajasthan Royals", wins: 94, losses: 105, trophies: "2008" },
        { name: "Royal Challengers Bangalore", wins: 100, losses: 111, trophies: null },
        { name: "Sunrisers Hyderabad", wins: 69, losses: 67, trophies: "2016" }
      ];

      const stmt = db.prepare("INSERT INTO teams (name, wins, losses, trophies) VALUES (?, ?, ?, ?)");
      teams.forEach(team => stmt.run(team.name, team.wins, team.losses, team.trophies));
      stmt.finalize();
      console.log("Sample teams added with performance data");
    }
  });

  // Insert sample players if none exist
  db.get("SELECT COUNT(*) as count FROM players", [], (err, row) => {
    if (err) {
      console.error("Error checking players:", err);
      return;
    }

    if (row.count === 0) {
      // Get team IDs first
      db.all("SELECT id, name FROM teams", [], (err, teams) => {
        if (err) {
          console.error("Error fetching teams:", err);
          return;
        }

        const teamMap = {};
        teams.forEach(team => {
          teamMap[team.name] = team.id;
        });

        // Sample players with their stats and image URLs
        const players = [
          {
            name: "Virat Kohli",
            role: "Batsman",
            team: "Royal Challengers Bangalore",
            runs: 7263,
            wickets: 4,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Virat%20Kohli.png"
          },
          {
            name: "MS Dhoni",
            role: "Wicket-Keeper Batsman",
            team: "Chennai Super Kings",
            runs: 5082,
            wickets: 0,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/MS%20Dhoni.png"
          },
          {
            name: "Rohit Sharma",
            role: "Batsman",
            team: "Mumbai Indians",
            runs: 6211,
            wickets: 15,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rohit%20Sharma.png"
          },
          {
            name: "Jasprit Bumrah",
            role: "Bowler",
            team: "Mumbai Indians",
            runs: 56,
            wickets: 157,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Jasprit%20Bumrah.png"
          },
          {
            name: "KL Rahul",
            role: "Batsman",
            team: "Lucknow Super Giants",
            runs: 4162,
            wickets: 0,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/KL%20Rahul.png"
          },
          {
            name: "Ravindra Jadeja",
            role: "All-Rounder",
            team: "Chennai Super Kings",
            runs: 2692,
            wickets: 152,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Ravindra%20Jadeja.png"
          },
          {
            name: "Andre Russell",
            role: "All-Rounder",
            team: "Kolkata Knight Riders",
            runs: 2262,
            wickets: 96,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Andre%20Russell.png"
          },
          {
            name: "Jos Buttler",
            role: "Wicket-Keeper Batsman",
            team: "Rajasthan Royals",
            runs: 3223,
            wickets: 0,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Jos%20Buttler.png"
          },
          {
            name: "Yuzvendra Chahal",
            role: "Bowler",
            team: "Rajasthan Royals",
            runs: 35,
            wickets: 187,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Yuzvendra%20Chahal.png"
          },
          {
            name: "Rishabh Pant",
            role: "Wicket-Keeper Batsman",
            team: "Delhi Capitals",
            runs: 3057,
            wickets: 0,
            image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rishabh%20Pant.png"
          }
        ];

        const stmt = db.prepare(
          "INSERT INTO players (name, role, team_id, runs, wickets, image_url) VALUES (?, ?, ?, ?, ?, ?)"
        );

        players.forEach(player => {
          const teamId = teamMap[player.team] || null;
          stmt.run(player.name, player.role, teamId, player.runs, player.wickets, player.image_url);
        });

        stmt.finalize();
        console.log("Sample players added");
      });
    }
  });
});

// API Routes

// Get all players
app.get('/players', (req, res) => {
  const query = `
    SELECT p.id, p.name, p.role, t.name AS team, p.runs, p.wickets, p.image_url
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY p.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching players:', err);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }
    res.json({ data: rows });
  });
});

// Get player by ID
app.get('/players/:id', (req, res) => {
  const query = `
    SELECT p.id, p.name, p.role, t.name AS team, p.runs, p.wickets, p.image_url
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.id = ?
  `;

  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching player:', err);
      return res.status(500).json({ error: 'Failed to fetch player' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ data: row });
  });
});

// Create new player
app.post('/players', (req, res) => {
  const { name, role, team_id, runs, wickets, image_url } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  const query = `
    INSERT INTO players (name, role, team_id, runs, wickets, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, role, team_id || null, runs || 0, wickets || 0, image_url || null], function (err) {
    if (err) {
      console.error('Error creating player:', err);
      return res.status(500).json({ error: 'Failed to create player' });
    }

    res.status(201).json({
      message: 'Player created successfully',
      data: {
        id: this.lastID,
        name,
        role,
        team_id,
        runs: runs || 0,
        wickets: wickets || 0,
        image_url: image_url || null
      }
    });
  });
});

// Update player
app.put('/players/:id', (req, res) => {
  const { name, role, team_id, runs, wickets, image_url } = req.body;
  const { id } = req.params;

  // First check if player exists
  db.get('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
    if (err) {
      console.error('Error checking player:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update the player
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
    ], function (err) {
      if (err) {
        console.error('Error updating player:', err);
        return res.status(500).json({ error: 'Failed to update player' });
      }

      res.json({ message: 'Player updated successfully' });
    });
  });
});

// Delete player
app.delete('/players/:id', (req, res) => {
  db.run('DELETE FROM players WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      console.error('Error deleting player:', err);
      return res.status(500).json({ error: 'Failed to delete player' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted successfully' });
  });
});

// Get all teams with their performance data
app.get('/teams', (req, res) => {
  db.all('SELECT id, name as team, wins, losses, trophies FROM teams ORDER BY wins DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching teams:', err);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
    
    res.json({ data: rows });
  });
});

// Get team by ID with performance data
app.get('/teams/:id', (req, res) => {
  db.get('SELECT id, name as team, wins, losses, trophies FROM teams WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching team:', err);
      return res.status(500).json({ error: 'Failed to fetch team' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({ data: row });
  });
});

// Update team with performance data
app.put('/teams/:id', (req, res) => {
  const { name, wins, losses, trophies } = req.body;
  const { id } = req.params;
  
  db.get('SELECT * FROM teams WHERE id = ?', [id], (err, team) => {
    if (err) {
      console.error('Error checking team:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    db.run(
      'UPDATE teams SET name = ?, wins = ?, losses = ?, trophies = ? WHERE id = ?',
      [
        name || team.name,
        wins !== undefined ? wins : team.wins,
        losses !== undefined ? losses : team.losses,
        trophies !== undefined ? trophies : team.trophies,
        id
      ], 
      function(err) {
        if (err) {
          console.error('Error updating team:', err);
          return res.status(500).json({ error: 'Failed to update team' });
        }
        
        res.json({ message: 'Team updated successfully' });
      }
    );
  });
});

// Get all unique roles
app.get('/roles', (req, res) => {
  db.all('SELECT DISTINCT role FROM players WHERE role IS NOT NULL', [], (err, rows) => {
    if (err) {
      console.error('Error fetching roles:', err);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }

    res.json({ data: rows });
  });
});

// Create new team
app.post('/teams', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  db.run('INSERT INTO teams (name) VALUES (?)', [name], function (err) {
    if (err) {
      console.error('Error creating team:', err);
      return res.status(500).json({ error: 'Failed to create team' });
    }

    res.status(201).json({
      message: 'Team created successfully',
      data: { id: this.lastID, name }
    });
  });
});

// Get top batsmen (Orange Cap)
app.get('/stats/batsmen', (req, res) => {
  db.all(`
    SELECT p.id, p.name, t.name as team, p.role, p.runs, p.image_url
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.runs > 0
    ORDER BY p.runs DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching batsmen stats:', err);
      return res.status(500).json({ error: 'Failed to fetch batsmen stats' });
    }

    res.json({ data: rows });
  });
});

// Get top bowlers (Purple Cap)
app.get('/stats/bowlers', (req, res) => {
  db.all(`
    SELECT p.id, p.name, t.name as team, p.role, p.wickets, p.image_url
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.wickets > 0
    ORDER BY p.wickets DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching bowlers stats:', err);
      return res.status(500).json({ error: 'Failed to fetch bowlers stats' });
    }

    res.json({ data: rows });
  });
});

// Get team rankings
app.get('/stats/teams', (req, res) => {
  db.all(`
    SELECT id, name as team, wins, losses, 
           (wins * 2) as points,
           CASE 
             WHEN (wins + losses) > 0 THEN ROUND((wins * 100.0) / (wins + losses), 1)
             ELSE 0 
           END as win_percentage,
           trophies
    FROM teams
    ORDER BY points DESC, win_percentage DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching team rankings:', err);
      return res.status(500).json({ error: 'Failed to fetch team rankings' });
    }

    res.json({ data: rows });
  });
});

// Get all stats for dashboard (top performers)
app.get('/stats/dashboard', (req, res) => {
  const stats = {};

  // Get top batsman (Orange Cap)
  db.get(`
    SELECT p.id, p.name, t.name as team, p.role, p.runs, p.image_url
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.runs > 0
    ORDER BY p.runs DESC
    LIMIT 1
  `, [], (err, topBatsman) => {
    if (err) {
      console.error('Error fetching top batsman:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    stats.topBatsman = topBatsman;

    // Get top bowler (Purple Cap)
    db.get(`
      SELECT p.id, p.name, t.name as team, p.role, p.wickets, p.image_url
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.wickets > 0
      ORDER BY p.wickets DESC
      LIMIT 1
    `, [], (err, topBowler) => {
      if (err) {
        console.error('Error fetching top bowler:', err);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }

      stats.topBowler = topBowler;

      // Get top team
      db.get(`
        SELECT id, name as team, wins, losses, 
               (wins * 2) as points,
               CASE 
                 WHEN (wins + losses) > 0 THEN ROUND((wins * 100.0) / (wins + losses), 1)
                 ELSE 0 
               END as win_percentage,
               trophies
        FROM teams
        ORDER BY points DESC, win_percentage DESC
        LIMIT 1
      `, [], (err, topTeam) => {
        if (err) {
          console.error('Error fetching top team:', err);
          return res.status(500).json({ error: 'Failed to fetch stats' });
        }

        stats.topTeam = topTeam;
        res.json({ data: stats });
      });
    });
  });
});

// Direct SQL query endpoint (for admin purposes - be careful with this in production!)
app.post('/query', (req, res) => {
  const query = req.body.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Simple check to prevent data modification - only allow SELECT queries
  if (!query.trim().toLowerCase().startsWith('select')) {
    return res.status(403).json({ error: 'Only SELECT queries are allowed' });
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get database schema
app.get('/schema', (req, res) => {
  const schema = {};
  
  // Get list of all tables
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, [], (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      return res.status(500).json({ error: 'Failed to fetch database schema' });
    }
    
    let tablesProcessed = 0;
    
    // For each table, get its column information
    tables.forEach(table => {
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`Error fetching columns for table ${table.name}:`, err);
          return res.status(500).json({ error: `Failed to fetch schema for table ${table.name}` });
        }
        
        // Format column information
        schema[table.name] = columns.map(col => ({
          name: col.name,
          type: col.type,
          pk: col.pk === 1
        }));
        
        tablesProcessed++;
        
        // When all tables are processed, send the schema
        if (tablesProcessed === tables.length) {
          res.json({ data: schema });
        }
      });
    });
  });
});

module.exports = app;