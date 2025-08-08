document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    
    // DOM Elements
    const teamsGrid = document.getElementById('teams-grid');
    const teamModal = document.getElementById('team-modal');
    const modalTitle = document.getElementById('modal-title');
    const teamForm = document.getElementById('team-form');
    const teamIdInput = document.getElementById('team-id');
    const teamNameInput = document.getElementById('team-name');
    const teamWinsInput = document.getElementById('team-wins');
    const teamLossesInput = document.getElementById('team-losses');
    const teamTrophiesInput = document.getElementById('team-trophies');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeModalBtn = document.querySelector('.close');
    
    // Click on carousel team logos
    document.querySelectorAll('.slider span img').forEach(img => {
        img.addEventListener('click', () => {
            const teamName = img.dataset.team;
            if (teamName) {
                scrollToTeam(teamName);
            }
        });
    });
    
    // Load all teams from API
    fetchTeams();
    
    // Event listeners for modal
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    teamForm.addEventListener('submit', handleTeamFormSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === teamModal) {
            closeModal();
        }
    });
    
    // Functions
    async function fetchTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`);
            const data = await response.json();
            
            if (data.error) {
                teamsGrid.innerHTML = `<div class="error">Error loading teams: ${data.error}</div>`;
                return;
            }
            
            displayTeams(data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            teamsGrid.innerHTML = '<div class="error">Failed to load teams. Please try again later.</div>';
        }
    }
    
    function displayTeams(teams) {
        if (!teams || teams.length === 0) {
            teamsGrid.innerHTML = '<div class="no-teams">No teams found</div>';
            return;
        }
        
        teamsGrid.innerHTML = '';
        
        teams.forEach(team => {
            const teamCard = createTeamCard(team);
            teamsGrid.appendChild(teamCard);
        });
    }
    
    function createTeamCard(team) {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.dataset.teamName = team.team;
        card.id = `team-${team.id}`;
        
        // Calculate win percentage
        const totalMatches = team.wins + team.losses;
        const winPercentage = totalMatches > 0 ? ((team.wins / totalMatches) * 100).toFixed(1) : 0;
        
        // Create trophy years display if available
        let trophyYearsHTML = '';
        if (team.trophies) {
            const trophyYears = team.trophies.split(',').map(year => year.trim());
            const trophyElements = trophyYears.map(year => `<div class="trophy-year">${year}</div>`).join('');
            trophyYearsHTML = `
                <div class="trophy-section">
                    <div class="trophy-title">
                        <i class="fas fa-trophy" style="color: gold;"></i> 
                        Championship Years
                    </div>
                    <div class="trophy-years">
                        ${trophyElements}
                    </div>
                </div>
            `;
        } else {
            trophyYearsHTML = `
                <div class="trophy-section">
                    <div class="trophy-title">No championships yet</div>
                </div>
            `;
        }
        
        // Get team abbreviation for logo
        const teamAbbreviation = getTeamAbbreviation(team.team);
        
        card.innerHTML = `
            <div class="team-header">
                <div class="team-logo">
                    <img src="${getTeamLogoUrl(team.team)}" 
                         alt="${team.team}"
                         onerror="this.src='images/${teamAbbreviation.toLowerCase()}.png'">
                </div>
                <div class="team-name">${team.team}</div>
            </div>
            <div class="team-body">
                <div class="team-stats">
                    <div class="stat">
                        <div class="stat-value">${team.wins}</div>
                        <div class="stat-label">Wins</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${team.losses}</div>
                        <div class="stat-label">Losses</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${team.wins * 2}</div>
                        <div class="stat-label">Points</div>
                    </div>
                </div>
                
                <div class="win-percentage">
                    <span>Win Rate:</span>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${winPercentage}%"></div>
                    </div>
                    <span><strong>${winPercentage}%</strong></span>
                </div>
                
                ${trophyYearsHTML}
                
                <div class="team-actions">
                    <button class="edit-team-btn" data-team-id="${team.id}">
                        <i class="fas fa-edit"></i> Update Stats
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to edit button
        const editBtn = card.querySelector('.edit-team-btn');
        editBtn.addEventListener('click', () => openEditTeamModal(team));
        
        return card;
    }
    
    function openEditTeamModal(team) {
        modalTitle.textContent = `Edit ${team.team}`;
        teamIdInput.value = team.id;
        teamNameInput.value = team.team;
        teamWinsInput.value = team.wins;
        teamLossesInput.value = team.losses;
        teamTrophiesInput.value = team.trophies || '';
        
        teamModal.style.display = 'block';
    }
    
    function closeModal() {
        teamModal.style.display = 'none';
        teamForm.reset();
    }
    
    async function handleTeamFormSubmit(e) {
        e.preventDefault();
        
        const teamId = teamIdInput.value;
        const teamData = {
            name: teamNameInput.value,
            wins: parseInt(teamWinsInput.value) || 0,
            losses: parseInt(teamLossesInput.value) || 0,
            trophies: teamTrophiesInput.value || null
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData)
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update team');
            }
            
            // Show success message
            alert('Team updated successfully!');
            closeModal();
            
            // Reload teams data
            fetchTeams();
        } catch (error) {
            console.error('Error updating team:', error);
            alert('Failed to update team: ' + error.message);
        }
    }
    
    function scrollToTeam(teamName) {
        const teamCard = document.querySelector(`[data-team-name="${teamName}"]`);
        if (teamCard) {
            teamCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the team card
            teamCard.classList.add('highlight');
            setTimeout(() => {
                teamCard.classList.remove('highlight');
            }, 2000);
        }
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
    
    // Helper function to get team logo URL
    function getTeamLogoUrl(team) {
        const abbreviation = getTeamAbbreviation(team);
        
        // Team-specific URL mappings
        const teamLogoUrls = {
            'CSK': 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png',
            'DC': 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png',
            'GT': 'https://documents.iplt20.com/ipl/GT/logos/Logooutline/GToutline.png',
            'KKR': 'https://documents.iplt20.com/ipl/KKR/logos/Logooutline/KKRoutline.png',
            'LSG': 'https://documents.iplt20.com/ipl/LSG/logos/Logooutline/LSGoutline.png',
            'MI': 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png',
            'PBKS': 'https://documents.iplt20.com/ipl/PBKS/logos/Logooutline/PBKSoutline.png',
            'RR': 'https://documents.iplt20.com/ipl/RR/logos/Logooutline/RRoutline.png',
            'RCB': 'https://documents.iplt20.com/ipl/RCB/logos/Logooutline/RCBoutline.png',
            'SRH': 'https://documents.iplt20.com/ipl/SRH/logos/Logooutline/SRHoutline.png'
        };
        
        return teamLogoUrls[abbreviation] || `images/${abbreviation.toLowerCase()}.png`;
    }
    
    // Add this CSS rule dynamically for the highlight effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0%, 100% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            50% { box-shadow: 0 0 20px rgba(0, 120, 215, 0.8); }
        }
        
        .highlight {
            animation: highlight 2s ease;
        }
    `;
    document.head.appendChild(style);
});