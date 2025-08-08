document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    let allPlayers = [];
    let allTeams = [];
    
    // DOM elements
    const playersGrid = document.getElementById('players-grid');
    const teamFilter = document.getElementById('team-filter');
    const roleFilter = document.getElementById('role-filter');
    const sortBySelect = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Modal elements
    const playerModal = document.getElementById('player-modal');
    const modalTitle = document.getElementById('modal-title');
    const playerForm = document.getElementById('player-form');
    const closeModal = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    const addPlayerBtn = document.getElementById('add-player-btn');
    
    // Form elements
    const playerIdInput = document.getElementById('player-id');
    const playerNameInput = document.getElementById('player-name');
    const playerRoleSelect = document.getElementById('player-role');
    const playerTeamSelect = document.getElementById('player-team');
    const playerRunsInput = document.getElementById('player-runs');
    const playerWicketsInput = document.getElementById('player-wickets');
    const playerImageInput = document.getElementById('player-image');
    
    // Fetch all players initially
    fetchPlayers();
    
    // Fetch teams for the filter and form
    fetchTeams();
    
    // Fetch roles for the filter
    fetchRoles();
    
    // Event listeners for filters
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    searchBtn.addEventListener('click', () => applyFilters());
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Event listeners for modal
    addPlayerBtn.addEventListener('click', () => openAddPlayerModal());
    closeModal.addEventListener('click', closePlayerModal);
    cancelBtn.addEventListener('click', closePlayerModal);
    playerForm.addEventListener('submit', handlePlayerFormSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === playerModal) {
            closePlayerModal();
        }
    });
    
    // Functions
    async function fetchPlayers() {
        try {
            const response = await fetch(`${API_BASE_URL}/players`);
            const data = await response.json();
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            allPlayers = data.data;
            displayPlayers(allPlayers);
        } catch (error) {
            showError('Failed to fetch players. Please try again later.');
            console.error(error);
        }
    }
    
    async function fetchTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`);
            const data = await response.json();
            
            if (data.error) {
                return;
            }
            
            allTeams = data.data;
            
            // Populate team filter dropdown
            data.data.forEach(team => {
                const option = document.createElement('option');
                option.value = team.team;
                option.textContent = team.team;
                teamFilter.appendChild(option);
                
                // Also add to the form's team dropdown
                const teamOption = document.createElement('option');
                teamOption.value = team.id;
                teamOption.textContent = team.team;
                playerTeamSelect.appendChild(teamOption);
            });
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        }
    }
    
    async function fetchRoles() {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`);
            const data = await response.json();
            
            if (data.error) {
                return;
            }
            
            data.data.forEach(role => {
                const option = document.createElement('option');
                option.value = role.role;
                option.textContent = role.role;
                roleFilter.appendChild(option);
                
                // We're using predefined role options in the form,
                // but we could also populate from API if needed
            });
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    }
    
    function displayPlayers(players) {
        playersGrid.innerHTML = '';
        
        if (players.length === 0) {
            playersGrid.innerHTML = '<p class="no-players">No players found matching your criteria.</p>';
            return;
        }
        
        players.forEach(player => {
            const playerCard = createPlayerCard(player);
            playersGrid.appendChild(playerCard);
        });
    }
    
    function createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.playerId = player.id;
        
        // Get appropriate icon for player role
        let roleIcon = '';
        if (player.role?.toLowerCase().includes('batsman')) {
            roleIcon = 'fa-solid fa-baseball-bat-ball';
        } else if (player.role?.toLowerCase().includes('bowler')) {
            roleIcon = 'fa-solid fa-baseball';
        } else if (player.role?.toLowerCase().includes('all-rounder')) {
            roleIcon = 'fa-solid fa-star';
        } else if (player.role?.toLowerCase().includes('wicket')) {
            roleIcon = 'fa-solid fa-gloves';
        } else {
            roleIcon = 'fa-solid fa-user';
        }
        
        // Default player image if none is provided
        const playerImage = player.image_url || 'https://www.iplt20.com/assets/images/default-player.png';
        
        card.innerHTML = `
            <div class="player-actions">
                <button class="edit-btn" title="Edit player"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete player"><i class="fas fa-trash"></i></button>
            </div>
            <div class="player-image">
                <img src="${playerImage}" alt="${player.name}" onerror="this.src='https://www.iplt20.com/assets/images/default-player.png'">
            </div>
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                ${player.team ? `<div class="player-team">${player.team}</div>` : ''}
            </div>
            <div class="player-body">
                ${player.role ? `
                <div class="player-role">
                    <i class="${roleIcon}"></i>
                    ${player.role}
                </div>` : ''}
                <div class="player-stats">
                    <div class="stat">
                        <div class="stat-value">${player.runs || 0}</div>
                        <div class="stat-label">Runs</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${player.wickets || 0}</div>
                        <div class="stat-label">Wickets</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for edit and delete buttons
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => openEditPlayerModal(player));
        deleteBtn.addEventListener('click', () => deletePlayer(player.id));
        
        return card;
    }
    
    function applyFilters() {
        const selectedTeam = teamFilter.value;
        const selectedRole = roleFilter.value;
        const sortBy = sortBySelect.value;
        const searchQuery = searchInput.value.toLowerCase().trim();
        
        let filteredPlayers = [...allPlayers];
        
        // Apply team filter
        if (selectedTeam) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.team && player.team.toLowerCase() === selectedTeam.toLowerCase()
            );
        }
        
        // Apply role filter
        if (selectedRole) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.role && player.role.toLowerCase() === selectedRole.toLowerCase()
            );
        }
        
        // Apply search
        if (searchQuery) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.name.toLowerCase().includes(searchQuery)
            );
        }
        
        // Apply sorting
        if (sortBy === 'name') {
            filteredPlayers.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'runs') {
            filteredPlayers.sort((a, b) => (b.runs || 0) - (a.runs || 0));
        } else if (sortBy === 'wickets') {
            filteredPlayers.sort((a, b) => (b.wickets || 0) - (a.wickets || 0));
        }
        
        displayPlayers(filteredPlayers);
    }
    
    function resetFilters() {
        teamFilter.value = '';
        roleFilter.value = '';
        sortBySelect.value = 'name';
        searchInput.value = '';
        
        displayPlayers(allPlayers);
    }
    
    function showError(message) {
        playersGrid.innerHTML = `<p class="error-message">${message}</p>`;
    }
    
    // Modal functions
    function openAddPlayerModal() {
        modalTitle.textContent = 'Add New Player';
        playerForm.reset();
        playerIdInput.value = '';
        playerModal.style.display = 'block';
    }
    
    function openEditPlayerModal(player) {
        modalTitle.textContent = 'Edit Player';
        playerIdInput.value = player.id;
        playerNameInput.value = player.name;
        playerRoleSelect.value = player.role;
        
        // Find the team ID for the player's team name
        if (player.team) {
            const team = allTeams.find(t => t.team === player.team);
            playerTeamSelect.value = team ? team.id : '';
        } else {
            playerTeamSelect.value = '';
        }
        
        playerRunsInput.value = player.runs || 0;
        playerWicketsInput.value = player.wickets || 0;
        playerImageInput.value = player.image_url || '';
        
        playerModal.style.display = 'block';
    }
    
    function closePlayerModal() {
        playerModal.style.display = 'none';
        playerForm.reset();
    }
    
    async function handlePlayerFormSubmit(e) {
        e.preventDefault();
        
        const playerId = playerIdInput.value;
        const playerData = {
            name: playerNameInput.value,
            role: playerRoleSelect.value,
            team_id: playerTeamSelect.value || null,
            runs: parseInt(playerRunsInput.value) || 0,
            wickets: parseInt(playerWicketsInput.value) || 0,
            image_url: playerImageInput.value || null
        };
        
        try {
            let response;
            let successMessage;
            
            if (playerId) {
                // Update existing player
                response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });
                successMessage = 'Player updated successfully!';
            } else {
                // Create new player
                response = await fetch(`${API_BASE_URL}/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });
                successMessage = 'Player added successfully!';
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred');
            }
            
            // Close modal and refresh players list
            closePlayerModal();
            await fetchPlayers();
            showToast(successMessage, 'success');
            
        } catch (error) {
            console.error('Error saving player:', error);
            showToast(error.message, 'error');
        }
    }
    
    async function deletePlayer(playerId) {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete this player?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred');
            }
            
            // Refresh players list
            await fetchPlayers();
            showToast('Player deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting player:', error);
            showToast(error.message, 'error');
        }
    }
    
    // Toast notification function
    function showToast(message, type = 'success') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-circle-check';
        if (type === 'error') {
            icon = 'fa-circle-exclamation';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});