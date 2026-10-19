document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
document.querySelectorAll("[data-demo-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const result = document.querySelector("[data-demo-result]");
    if (!result) return;
    result.textContent = button.dataset.demoAction === "approve"
      ? "Example approved — in a connected pilot, the reviewed hold would now be created."
      : "Example dismissed — no calendar changes were made.";
  });
});
