document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Start the hero sequence once the illustration is on screen. The CSS only
// animates when motion is allowed; otherwise the finished frame is shown.
const flow = document.querySelector(".flow");
if (flow) {
  const play = () => flow.classList.add("is-playing");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(flow);
  } else {
    play();
  }
}
