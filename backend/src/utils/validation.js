const validatePlayer = (playerData) => {
  const { name, role } = playerData;

  if (!name || !role) {
    return {
      isValid: false,
      message: 'Name and role are required'
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Player name must be at least 2 characters long'
    };
  }

  const validRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper Batsman'];
  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      message: `Role must be one of: ${validRoles.join(', ')}`
    };
  }

  return { isValid: true };
};

module.exports = {
  validatePlayer
};