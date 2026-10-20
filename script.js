document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Hero demo. Each scene lists the times (ms from its start) at which steps
// s1…sN begin, and when it ends. The sequence plays once when the demo first
// scrolls into view, unless the viewer prefers reduced motion, and can be
// paused, replayed, or started from any chapter.
const demo = document.querySelector(".demo");
if (demo) {
  const scenes = [...demo.querySelectorAll(".scene")];
  const chapters = [...demo.querySelectorAll("[data-chapter]")];
  const toggle = demo.querySelector("[data-toggle]");
  const toggleLabel = demo.querySelector("[data-toggle-label]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const plans = scenes.map((scene) => ({
    steps: scene.dataset.steps.split(",").map(Number),
    end: Number(scene.dataset.end),
  }));

  let current = 0;
  let step = 0;
  let timer = 0;
  let sceneStart = 0;
  let pausedAt = 0;
  let started = false;

  const setStep = (scene, n) => {
    for (let i = 1; i <= 6; i++) scene.classList.toggle(`s${i}`, i <= n);
  };

  const setState = (state) => {
    demo.dataset.state = state;
    const labels = { playing: "Pause", paused: "Play", ready: "Play", ended: "Replay" };
    toggleLabel.textContent = labels[state];
  };

  const show = (index, complete) => {
    current = index;
    scenes.forEach((scene, i) => {
      scene.classList.toggle("is-active", i === index);
      setStep(scene, i === index && !complete ? 0 : plans[i].steps.length);
    });
    chapters.forEach((chapter, i) => {
      chapter.setAttribute("aria-pressed", String(i === index));
      chapter.classList.toggle("is-done", i < index);
    });
    demo.style.setProperty("--chapter-ms", `${plans[index].end}ms`);
  };

  const tick = () => {
    const plan = plans[current];
    const elapsed = performance.now() - sceneStart;
    while (step < plan.steps.length && plan.steps[step] <= elapsed) {
      step += 1;
      setStep(scenes[current], step);
    }
    if (step >= plan.steps.length && elapsed >= plan.end) {
      if (current < scenes.length - 1) playScene(current + 1);
      else setState("ended");
      return;
    }
    const next = step < plan.steps.length ? plan.steps[step] : plan.end;
    timer = window.setTimeout(tick, Math.max(0, next - elapsed));
  };

  const playScene = (index) => {
    window.clearTimeout(timer);
    started = true;
    setState("ready");
    show(index, false);
    // Restart the chapter's progress bar even when replaying the same chapter.
    void demo.offsetWidth;
    setState("playing");
    step = 0;
    sceneStart = performance.now();
    tick();
  };

  const pause = () => {
    window.clearTimeout(timer);
    pausedAt = performance.now() - sceneStart;
    setState("paused");
  };

  const resume = () => {
    sceneStart = performance.now() - pausedAt;
    setState("playing");
    tick();
  };

  // A sequence that will autoplay starts from an empty card, so it does not
  // flash its finished frame first; otherwise the finished first scene shows.
  const autoplay = !reduceMotion.matches && "IntersectionObserver" in window;
  show(0, !autoplay);
  setState("ready");
  demo.querySelector(".demo-controls").hidden = false;

  toggle.addEventListener("click", () => {
    const state = demo.dataset.state;
    if (state === "playing") pause();
    else if (state === "paused") resume();
    else if (state === "ended") playScene(0);
    else playScene(current);
  });

  chapters.forEach((chapter, i) => {
    chapter.addEventListener("click", () => {
      if (reduceMotion.matches) {
        window.clearTimeout(timer);
        started = true;
        show(i, true);
        setState("ready");
      } else {
        playScene(i);
      }
    });
  });

  if (autoplay) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (!started) playScene(0);
      },
      { threshold: 0.4 },
    );
    observer.observe(demo.querySelector(".demo-stage"));
  }
}
