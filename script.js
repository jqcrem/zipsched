document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Hero demo. Each scene lists the times (ms from its start) at which steps
// s1…sN begin, and when it ends. A chapter button names its scene and, when it
// starts partway through one, the time it starts at, so one continuous scene
// can carry two chapters. The sequence plays once when the demo first scrolls
// into view, unless the viewer prefers reduced motion, and can be paused,
// replayed, or started from any chapter.
const demo = document.querySelector(".demo");
if (demo) {
  const scenes = [...demo.querySelectorAll(".scene")];
  const buttons = [...demo.querySelectorAll(".chapter")];
  const toggle = demo.querySelector("[data-toggle]");
  const toggleLabel = demo.querySelector("[data-toggle-label]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const plans = scenes.map((scene) => ({
    steps: scene.dataset.steps.split(",").map(Number),
    end: Number(scene.dataset.end),
  }));
  const chapters = buttons.map((button, i) => {
    const scene = Number(button.dataset.scene);
    const next = buttons[i + 1];
    const sameScene = next && Number(next.dataset.scene) === scene;
    return {
      button,
      scene,
      from: Number(button.dataset.from ?? 0),
      to: sameScene ? Number(next.dataset.from ?? 0) : plans[scene].end,
    };
  });
  const maxSteps = Math.max(...plans.map((plan) => plan.steps.length));

  let scene = 0;
  let step = 0;
  let chapter = 0;
  let timer = 0;
  let sceneStart = 0;
  let pausedAt = 0;
  let started = false;

  const setStep = (element, n) => {
    for (let i = 1; i <= maxSteps; i++) element.classList.toggle(`s${i}`, i <= n);
  };
  const stepsBefore = (index, ms) => plans[index].steps.filter((t) => t < ms).length;

  const setState = (state) => {
    demo.dataset.state = state;
    const labels = { playing: "Pause", paused: "Play", ready: "Play", ended: "Replay" };
    toggleLabel.textContent = labels[state];
  };

  // Activate a scene with its first `steps` steps already applied, without
  // animating them in; the scene itself still fades in.
  const showScene = (index, steps) => {
    const target = scenes[index];
    target.classList.add("instant");
    scenes.forEach((element, i) => {
      element.classList.toggle("is-active", i === index);
      setStep(element, i === index ? steps : plans[i].steps.length);
    });
    void target.offsetWidth;
    target.classList.remove("instant");
    scene = index;
    step = steps;
  };

  const markChapter = (index, elapsedInChapter) => {
    chapter = index;
    chapters.forEach((entry, i) => {
      entry.button.setAttribute("aria-pressed", String(i === index));
      entry.button.classList.toggle("is-done", i < index);
    });
    const entry = chapters[index];
    demo.style.setProperty("--chapter-ms", `${entry.to - entry.from}ms`);
    demo.style.setProperty("--chapter-delay", `${-elapsedInChapter}ms`);
  };

  const tick = () => {
    const plan = plans[scene];
    const elapsed = performance.now() - sceneStart;
    while (step < plan.steps.length && plan.steps[step] <= elapsed) {
      step += 1;
      setStep(scenes[scene], step);
    }
    const next = chapters[chapter + 1];
    const nextInScene = next && next.scene === scene;
    if (nextInScene && next.from <= elapsed) {
      markChapter(chapter + 1, elapsed - next.from);
      tick();
      return;
    }
    if (step >= plan.steps.length && elapsed >= plan.end) {
      if (scene < scenes.length - 1) playChapter(chapters.findIndex((c) => c.scene === scene + 1));
      else setState("ended");
      return;
    }
    const due = [plan.end];
    if (step < plan.steps.length) due.push(plan.steps[step]);
    if (nextInScene) due.push(next.from);
    timer = window.setTimeout(tick, Math.max(0, Math.min(...due) - elapsed));
  };

  const playChapter = (index) => {
    window.clearTimeout(timer);
    started = true;
    const entry = chapters[index];
    showScene(entry.scene, stepsBefore(entry.scene, entry.from));
    setState("ready");
    markChapter(index, 0);
    // Restart the chapter's progress bar even when replaying the same chapter.
    void demo.offsetWidth;
    setState("playing");
    sceneStart = performance.now() - entry.from;
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

  // Without motion a chapter is shown as the frame it ends on.
  const showChapter = (index) => {
    window.clearTimeout(timer);
    started = true;
    const entry = chapters[index];
    showScene(entry.scene, stepsBefore(entry.scene, entry.to));
    markChapter(index, 0);
    setState("ready");
  };

  // A sequence that will autoplay starts from an empty card, so it does not
  // flash its finished frame first; otherwise the finished first scene shows.
  const autoplay = !reduceMotion.matches && "IntersectionObserver" in window;
  showScene(0, autoplay ? 0 : plans[0].steps.length);
  markChapter(0, 0);
  setState("ready");
  demo.querySelector(".demo-controls").hidden = false;

  toggle.addEventListener("click", () => {
    const state = demo.dataset.state;
    if (state === "playing") pause();
    else if (state === "paused") resume();
    else if (state === "ended") playChapter(0);
    else playChapter(chapter);
  });

  chapters.forEach((entry, i) => {
    entry.button.addEventListener("click", () => {
      if (reduceMotion.matches) showChapter(i);
      else playChapter(i);
    });
  });

  if (autoplay) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (!started) playChapter(0);
      },
      { threshold: 0.4 },
    );
    observer.observe(demo.querySelector(".demo-stage"));
  }
}
