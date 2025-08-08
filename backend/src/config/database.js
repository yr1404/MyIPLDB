const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../ipl_database.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
      }
      console.log('✅ Connected to SQLite database');
    });
    
    this.initializeTables();
  }

  initializeTables() {
    this.db.serialize(() => {
      // Create tables
      this.createTables();
      // Insert sample data
      this.insertSampleData();
    });
  }

  createTables() {
    const teamTable = `
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        trophies TEXT DEFAULT NULL
      )
    `;

    const playerTable = `
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        team_id INTEGER,
        runs INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        image_url TEXT,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `;

    this.db.run(teamTable);
    this.db.run(playerTable);
  }

  insertSampleData() {
    // Check and insert teams
    this.db.get("SELECT COUNT(*) as count FROM teams", [], (err, row) => {
      if (err || row.count > 0) return;

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

      const stmt = this.db.prepare("INSERT INTO teams (name, wins, losses, trophies) VALUES (?, ?, ?, ?)");
      teams.forEach(team => stmt.run(team.name, team.wins, team.losses, team.trophies));
      stmt.finalize();
      console.log("✅ Sample teams added");
    });

    // Check and insert players
    this.db.get("SELECT COUNT(*) as count FROM players", [], (err, row) => {
      if (err || row.count > 0) return;

      this.db.all("SELECT id, name FROM teams", [], (err, teams) => {
        if (err) return;

        const teamMap = {};
        teams.forEach(team => teamMap[team.name] = team.id);

        const players = [
          { name: "Virat Kohli", role: "Batsman", team: "Royal Challengers Bangalore", runs: 7263, wickets: 4, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Virat%20Kohli.png" },
          { name: "MS Dhoni", role: "Wicket-Keeper Batsman", team: "Chennai Super Kings", runs: 5082, wickets: 0, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/MS%20Dhoni.png" },
          { name: "Rohit Sharma", role: "Batsman", team: "Mumbai Indians", runs: 6211, wickets: 15, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rohit%20Sharma.png" },
          { name: "Jasprit Bumrah", role: "Bowler", team: "Mumbai Indians", runs: 56, wickets: 157, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Jasprit%20Bumrah.png" },
          { name: "KL Rahul", role: "Batsman", team: "Lucknow Super Giants", runs: 4162, wickets: 0, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/KL%20Rahul.png" },
          { name: "Ravindra Jadeja", role: "All-Rounder", team: "Chennai Super Kings", runs: 2692, wickets: 152, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Ravindra%20Jadeja.png" },
          { name: "Andre Russell", role: "All-Rounder", team: "Kolkata Knight Riders", runs: 2262, wickets: 96, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Andre%20Russell.png" },
          { name: "Jos Buttler", role: "Wicket-Keeper Batsman", team: "Rajasthan Royals", runs: 3223, wickets: 0, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Jos%20Buttler.png" },
          { name: "Yuzvendra Chahal", role: "Bowler", team: "Rajasthan Royals", runs: 35, wickets: 187, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Yuzvendra%20Chahal.png" },
          { name: "Rishabh Pant", role: "Wicket-Keeper Batsman", team: "Delhi Capitals", runs: 3057, wickets: 0, image_url: "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rishabh%20Pant.png" }
        ];

        const stmt = this.db.prepare("INSERT INTO players (name, role, team_id, runs, wickets, image_url) VALUES (?, ?, ?, ?, ?, ?)");
        players.forEach(player => {
          const teamId = teamMap[player.team] || null;
          stmt.run(player.name, player.role, teamId, player.runs, player.wickets, player.image_url);
        });
        stmt.finalize();
        console.log("✅ Sample players added");
      });
    });
  }

  getDb() {
    return this.db;
  }
}

const database = new Database();
module.exports = database.getDb();