// === Make Menu Visible ===
function makeMenuVisible() {
    const menu = document.querySelector('#menu');
    const model = document.getElementById("model-container");

    if (!menu || !model) return;

    const screenWidth = window.innerWidth;

    // Apply transformations based on screen size
    if (screenWidth < 768) {
        // Small screens: move model up
        model.style.transform = "translateY(-25%)";
    } else {
        // Larger screens: move model left
        model.style.transform = "translateX(-25%)";
    }

    menu.classList.add("visible"); // Show the menu
}

export { makeMenuVisible };
