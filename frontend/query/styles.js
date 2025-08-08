document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("queryBox");

  document.addEventListener("mousemove", (e) => {
    rotateElement(e, textarea);
  });

  function rotateElement(event, element) {
    if (!element) return;

    const x = event.clientX;
    const y = event.clientY;

    const middleX = window.innerWidth / 2;
    const middleY = window.innerHeight / 2;

    const offsetX = ((x - middleX) / middleX) * 15;
    const offsetY = ((y - middleY) / middleY) * 15;

    element.style.setProperty("--rotateX", offsetX + "deg");
    element.style.setProperty("--rotateY", -1 * offsetY + "deg");
  }
});