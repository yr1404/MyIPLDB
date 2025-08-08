document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';

    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Top performer card containers
    const topBatsmanCard = document.getElementById('top-batsman-card');
    const topBowlerCard = document.getElementById('top-bowler-card');
    const topTeamCard = document.getElementById('top-team-card');

    // Table bodies
    const teamsTableBody = document.getElementById('teams-table-body');
    const batsmenTableBody = document.getElementById('batsmen-table-body');
    const bowlersTableBody = document.getElementById('bowlers-table-body');

    // Load all data
    fetchDashboardStats();
    fetchTeamRankings();
    fetchBatsmenRankings();
    fetchBowlersRankings();

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Activate selected tab
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Functions to fetch and display data
    async function fetchDashboardStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/dashboard`);
            const data = await response.json();

            if (data.error) {
                showError('Failed to load dashboard stats');
                return;
            }

            // Display top performers
            displayTopBatsman(data.data.topBatsman);
            displayTopBowler(data.data.topBowler);
            displayTopTeam(data.data.topTeam);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            showError('Failed to load dashboard stats');
        }
    }

    async function fetchTeamRankings() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/teams`);
            const data = await response.json();

            if (data.error) {
                teamsTableBody.innerHTML = `<tr><td colspan="8" class="error">Failed to load team rankings</td></tr>`;
                return;
            }

            displayTeamRankings(data.data);
        } catch (error) {
            console.error('Error fetching team rankings:', error);
            teamsTableBody.innerHTML = `<tr><td colspan="8" class="error">Failed to load team rankings</td></tr>`;
        }
    }

    async function fetchBatsmenRankings() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/batsmen`);
            const data = await response.json();

            if (data.error) {
                batsmenTableBody.innerHTML = `<tr><td colspan="5" class="error">Failed to load batsmen rankings</td></tr>`;
                return;
            }

            displayBatsmenRankings(data.data);
        } catch (error) {
            console.error('Error fetching batsmen rankings:', error);
            batsmenTableBody.innerHTML = `<tr><td colspan="5" class="error">Failed to load batsmen rankings</td></tr>`;
        }
    }

    async function fetchBowlersRankings() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/bowlers`);
            const data = await response.json();

            if (data.error) {
                bowlersTableBody.innerHTML = `<tr><td colspan="5" class="error">Failed to load bowlers rankings</td></tr>`;
                return;
            }

            displayBowlersRankings(data.data);
        } catch (error) {
            console.error('Error fetching bowlers rankings:', error);
            bowlersTableBody.innerHTML = `<tr><td colspan="5" class="error">Failed to load bowlers rankings</td></tr>`;
        }
    }

    // Display functions
    function displayTopBatsman(batsman) {
        if (!batsman) {
            topBatsmanCard.innerHTML = '<p class="error">No data available</p>';
            return;
        }

        const playerImage = batsman.image_url || 'https://www.iplt20.com/assets/images/default-player.png';

        topBatsmanCard.innerHTML = `
            <div class="player-profile">
                <div class="player-image-container">
                    <img src="${playerImage}" alt="${batsman.name}" onerror="this.src='https://www.iplt20.com/assets/images/default-player.png'">
                </div>
                <div class="player-info">
                    <div class="player-name">${batsman.name}</div>
                    <div class="player-team">${batsman.team || 'No Team'}</div>
                    <div class="player-stats">
                        <div class="stat-value">${batsman.runs}</div>
                        <div class="stat-label">Runs</div>
                    </div>
                </div>
            </div>
        `;
    }

    function displayTopBowler(bowler) {
        if (!bowler) {
            topBowlerCard.innerHTML = '<p class="error">No data available</p>';
            return;
        }

        const playerImage = bowler.image_url || 'https://www.iplt20.com/assets/images/default-player.png';

        topBowlerCard.innerHTML = `
            <div class="player-profile">
                <div class="player-image-container">
                    <img src="${playerImage}" alt="${bowler.name}" onerror="this.src='https://www.iplt20.com/assets/images/default-player.png'">
                </div>
                <div class="player-info">
                    <div class="player-name">${bowler.name}</div>
                    <div class="player-team">${bowler.team || 'No Team'}</div>
                    <div class="player-stats">
                        <div class="stat-value">${bowler.wickets}</div>
                        <div class="stat-label">Wickets</div>
                    </div>
                </div>
            </div>
        `;
    }

    function displayTopTeam(team) {
        if (!team) {
            topTeamCard.innerHTML = '<p class="error">No data available</p>';
            return;
        }

        // Create trophy years display if available
        let trophyDisplay = '';
        if (team.trophies) {
            const trophyYears = team.trophies.split(',').map(year => year.trim());
            const trophyElements = trophyYears.map(year => `<span class="trophy-year">${year}</span>`).join('');
            trophyDisplay = `
                <div class="team-trophies">
                    <strong>Trophies:</strong>
                    <div class="trophy-years">
                        ${trophyElements}
                    </div>
                </div>
            `;
        }

        // Get team abbreviation for logo URL
        const teamAbbreviation = getTeamAbbreviation(team.team);

        if (teamAbbreviation === 'DC') {
            logoUrlPattern = `
            src="https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png"
            onerror="this.onerror=null; this.src='https://documents.iplt20.com/ipl/DC/logos/logooutline/dcoutline.png';"
        `;
        } else {
            logoUrlPattern = `
            src="https://documents.iplt20.com/ipl/${teamAbbreviation}/logos/Logooutline/${teamAbbreviation}outline.png"
            onerror="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/Logos/Logooutline/${teamAbbreviation}outline.png';"
            onabort="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/logos/LogoOutline/${teamAbbreviation}outline.png';"
            oninvalid="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/Logos/LogoOutline/${teamAbbreviation}outline.png';"
        `;
        }

        topTeamCard.innerHTML = `
            <div class="team-profile">
                <div class="team-logo">
                    <img ${logoUrlPattern}>
                </div>
                <div class="team-info">
                    <div class="team-name">${team.team}</div>
                    <div class="team-stats">
                        <div class="team-record">
                            <strong>W/L:</strong> ${team.wins}/${team.losses} (${team.win_percentage}%)
                        </div>
                        <div class="team-record">
                            <strong>Points:</strong> ${team.points}
                        </div>
                        ${trophyDisplay}
                    </div>
                </div>
            </div>
        `;
    }

    // Helper function to get team abbreviation
    function getTeamAbbreviation(teamName) {
        const abbreviations = {
            'Chennai Super Kings': 'CSK',
            'Delhi Capitals': 'DC',
            'Gujarat Titans': 'GT',
            'Kolkata Knight Riders': 'KKR',
            'Lucknow Super Giants': 'LSG',
            'Mumbai Indians': 'MI',
            'Punjab Kings': 'PBKS',
            'Rajasthan Royals': 'RR',
            'Royal Challengers Bangalore': 'RCB',
            'Sunrisers Hyderabad': 'SRH'
        };

        return abbreviations[teamName] || teamName.split(' ').map(word => word[0]).join('');
    }

    function displayTeamRankings(teams) {
        if (!teams || teams.length === 0) {
            teamsTableBody.innerHTML = '<tr><td colspan="8">No team data available</td></tr>';
            return;
        }

        teamsTableBody.innerHTML = '';

        teams.forEach((team, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';

            // Create trophy display
            let trophyHTML = '';
            if (team.trophies) {
                const count = team.trophies.split(',').length;
                trophyHTML = Array(count).fill('<i class="fas fa-trophy trophy"></i>').join('');
            }

            const teamAbbreviation = getTeamAbbreviation(team.team);

            // Special handling for Delhi Capitals
            let logoUrlPattern;
            if (teamAbbreviation === 'DC') {
                logoUrlPattern = `
                src="https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png"
                onerror="this.onerror=null; this.src='https://documents.iplt20.com/ipl/DC/logos/logooutline/dcoutline.png';"
            `;
            } else {
                logoUrlPattern = `
                src="https://documents.iplt20.com/ipl/${teamAbbreviation}/logos/Logooutline/${teamAbbreviation}outline.png"
                onerror="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/Logos/Logooutline/${teamAbbreviation}outline.png';"
                onabort="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/logos/LogoOutline/${teamAbbreviation}outline.png';"
                oninvalid="this.onerror=null; this.src='https://documents.iplt20.com/ipl/${teamAbbreviation}/Logos/LogoOutline/${teamAbbreviation}outline.png';"
            `;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
    <td class="${rankClass}">${rank}</td>
    <td>
        <div class="team-name-with-logo">
            <img class="team-logo-small" 
                 ${logoUrlPattern}
                 alt="${team.team}">
            ${team.team}
        </div>
    </td>
    <td>${team.wins + team.losses}</td>
    <td>${team.wins}</td>
    <td>${team.losses}</td>
    <td>${team.points}</td>
    <td>${team.win_percentage}%</td>
    <td><div class="trophy-list">${trophyHTML}</div></td>
`;
            teamsTableBody.appendChild(row);
        });
    }

    function displayBatsmenRankings(batsmen) {
        if (!batsmen || batsmen.length === 0) {
            batsmenTableBody.innerHTML = '<tr><td colspan="5">No batsmen data available</td></tr>';
            return;
        }

        batsmenTableBody.innerHTML = '';

        batsmen.forEach((batsman, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="${rankClass}">${rank}</td>
                <td>${batsman.name}</td>
                <td>${batsman.team || '-'}</td>
                <td>${batsman.role || '-'}</td>
                <td>${batsman.runs}</td>
            `;
            batsmenTableBody.appendChild(row);
        });
    }

    function displayBowlersRankings(bowlers) {
        if (!bowlers || bowlers.length === 0) {
            bowlersTableBody.innerHTML = '<tr><td colspan="5">No bowlers data available</td></tr>';
            return;
        }

        bowlersTableBody.innerHTML = '';

        bowlers.forEach((bowler, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="${rankClass}">${rank}</td>
                <td>${bowler.name}</td>
                <td>${bowler.team || '-'}</td>
                <td>${bowler.role || '-'}</td>
                <td>${bowler.wickets}</td>
            `;
            bowlersTableBody.appendChild(row);
        });
    }

    function showError(message) {
        console.error(message);
        // You could also display an error message on the page
    }
});