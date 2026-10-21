document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Hero demo. Fourteen emails drop onto a messy pile, four slowly and then ten
// in a rush, spreading right until the pile nearly leaves the window. The pile
// gathers to the left, each email flies to a deck and turns over into the
// action it asks for, and a cursor drags every card right to approve it or
// left to decline it. Every move is a Web Animation scheduled from one shared
// start, so the sequence pauses, resumes and lays itself out again after a
// resize by setting a single time on all of them. It plays once when the stage
// comes into view; a viewer who prefers reduced motion gets a still frame and
// can press play.
const demo = document.querySelector(".demo");
if (demo && !("animate" in Element.prototype)) demo.hidden = true;
else if (demo) {
  const ICONS = {
    mail: '<svg viewBox="0 0 16 16" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.75"/><path d="M2.5 4.5L8 9l5.5-4.5"/></g></svg>',
    hold: '<svg viewBox="0 0 16 16" width="13" height="13"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3M8 8.5v3M6.5 10h3"/></g></svg>',
    times: '<svg viewBox="0 0 16 16" width="13" height="13"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5.75"/><path d="M8 5v3.25l2 1.25"/></g></svg>',
    invitee: '<svg viewBox="0 0 16 16" width="13" height="13"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5c.6-2.4 2.3-3.5 4.5-3.5s3.9 1.1 4.5 3.5M12.5 5v4M10.5 7h4"/></g></svg>',
    no: '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    yes: '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const KINDS = { hold: "New hold", times: "Pick times", invitee: "Add invitee" };

  // In arrival order. The first SLOW arrive one at a time and are reviewed
  // one at a time; the rest rush in and are approved in a rush. Names and
  // times are fictional, and no two approved holds or offered times overlap.
  const MAILS = [
    { from: "Dana Whitfield", at: "9:02 AM", meta: "Board deck", ask: "Can we find <mark>45 minutes Thursday afternoon</mark>?",
      kind: "hold", title: "Board deck review", when: "Thu · 2:00–2:45 PM" },
    { from: "Marcus Bell", at: "9:14 AM", meta: "Coffee?", ask: "Could we grab <mark>coffee Friday at 8:30</mark>?",
      kind: "hold", title: "Coffee with Marcus Bell", when: "Fri · 8:30–9:00 AM" },
    { from: "Alex Rivera", at: "9:31 AM", meta: "to Jordan Lee · cc Sam (EA)", ask: "<mark>Cc’ing my EA</mark> to find us a time next week.",
      kind: "times", title: "Re: Intro, Alex / Jordan", times: ["Tue · 10:00–10:30 AM", "Wed · 11:00–11:30 AM", "Thu · 10:30–11:30 AM"] },
    { from: "Alex Rivera", at: "9:47 AM", meta: "Investor call", ask: "Can you <mark>add Tim to Thursday’s call</mark>? He’s joining from the fund.",
      kind: "invitee", title: "Investor call", when: "Thu · 3:30–4:00 PM", invitees: ["Alex Rivera", "Priya Shah"], add: "Tim Okafor" },
    { from: "Priya Shah", at: "10:03 AM", meta: "Lunch", ask: "<mark>Lunch next Tuesday</mark> at 12:30?",
      kind: "hold", title: "Lunch with Priya Shah", when: "Tue · 12:30–1:30 PM" },
    { from: "Jordan Lee", at: "10:05 AM", meta: "Catching up", ask: "What works for <mark>a call next week</mark>?",
      kind: "times", title: "Call with Jordan Lee", times: ["Mon · 2:00–2:30 PM", "Tue · 4:00–4:30 PM", "Wed · 9:30–10:00 AM"] },
    { from: "Lena Fischer", at: "10:08 AM", meta: "Contract review", ask: "Please <mark>loop in Maya</mark> from legal.",
      kind: "invitee", title: "Contract review", when: "Wed · 1:00–1:45 PM", invitees: ["Lena Fischer", "Alex Rivera"], add: "Maya Chen" },
    { from: "Omar Haddad", at: "10:12 AM", meta: "Dinner", ask: "<mark>Dinner Thursday at 7</mark>?",
      kind: "hold", title: "Dinner with Omar Haddad", when: "Thu · 7:00–9:00 PM" },
    { from: "Chris Novak", at: "10:15 AM", meta: "Demo", ask: "Send me <mark>a few times for a demo</mark>.",
      kind: "times", title: "Demo for Chris Novak", times: ["Tue · 1:30–2:00 PM", "Wed · 11:30 AM–12:00 PM", "Fri · 11:00–11:30 AM"] },
    { from: "Dana Whitfield", at: "10:19 AM", meta: "Board deck review", ask: "Can we <mark>add Raj</mark> to the board deck review?",
      kind: "invitee", title: "Board deck review", when: "Thu · 2:00–2:45 PM", invitees: ["Dana Whitfield", "Alex Rivera"], add: "Raj Patel" },
    { from: "Grace Liu", at: "10:22 AM", meta: "Q4 review", ask: "<mark>Quarterly review, 60 min</mark>, Wednesday?",
      kind: "hold", title: "Quarterly review", when: "Wed · 3:00–4:00 PM" },
    { from: "Ben Carter", at: "10:26 AM", meta: "Intro", ask: "<mark>Intro call Monday at 9</mark>?",
      kind: "hold", title: "Intro call with Ben Carter", when: "Mon · 9:00–9:30 AM" },
    { from: "Nadia Park", at: "10:31 AM", meta: "Weekly sync", ask: "Please <mark>include Theo</mark> on Friday’s sync.",
      kind: "invitee", title: "Weekly sync", when: "Fri · 10:00–10:30 AM", invitees: ["Nadia Park", "Alex Rivera"], add: "Theo Grant" },
    { from: "Hannah Moss", at: "10:34 AM", meta: "Team time", ask: "Can we find <mark>30 minutes with the team</mark>?",
      kind: "times", title: "Team check-in", times: ["Mon · 3:00–3:30 PM", "Tue · 11:00–11:30 AM", "Thu · 4:30–5:00 PM"] },
  ];
  const SLOW = 4;
  /** Index of the one card the cursor declines */
  const DECLINED = 1;
  // Hand-set mess, one row per email: x and y offset on the pile (`px` at
  // desktop size), its tilt there (`deg`), and the slighter tilt of its card
  // on the deck (`deg`).
  const SCATTER = [
    [0, -18, -4, -1.5], [8, 22, 3.5, 2], [-6, -30, -2, -1], [10, 14, 5, 1.5],
    [-4, -6, -6, -2], [6, 30, 2.5, 1], [-10, -24, 7, -1.5], [4, 8, -3, 2.5],
    [-8, 26, 4.5, -2], [12, -14, -5.5, 1], [-2, 18, 1.5, -2.5], [6, -28, -7, 1.5],
    [-6, 4, 3, -1], [0, -8, -1.5, 2],
  ];
  const DROP = "cubic-bezier(0.2, 0.8, 0.25, 1)";
  const MOVE = "cubic-bezier(0.45, 0, 0.25, 1)";
  const DRAG = "cubic-bezier(0.4, 0, 0.3, 1)";
  const THROW = "cubic-bezier(0.55, 0, 0.85, 0.4)";

  const stage = demo.querySelector(".stage");
  const guide = stage.querySelector(".stage-guide");
  const cursor = stage.querySelector(".stage-cursor");
  const press = stage.querySelector(".stage-press");
  const summary = stage.querySelector(".stage-summary");
  const toggle = demo.querySelector("[data-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const mails = MAILS.map((m, i) => {
    const card = document.createElement("article");
    card.className = "mail";
    card.style.zIndex = String(i + 1);
    card.innerHTML = `<p class="mail-head">${ICONS.mail}<span class="mail-from">${m.from}</span><span class="mail-at mono">${m.at}</span></p><p class="mail-meta mono">${m.meta}</p><p class="mail-ask">“${m.ask}”</p>`;
    stage.querySelector(".stage-mail").append(card);
    return card;
  });
  // The deck is built newest email first, so the first email's card ends up
  // on top: each card sits above every card for a later email.
  const acts = MAILS.map((m, i) => {
    const card = document.createElement("article");
    card.className = "act";
    card.style.zIndex = String(MAILS.length - i);
    // A hold quotes the ask it came from; the other kinds fill their card
    // with the times or the invitees.
    const detail =
      m.kind === "times"
        ? `<ul class="act-times mono">${m.times.map((time) => `<li>${time}</li>`).join("")}</ul>`
        : `<p class="act-when mono">${m.when}</p>${m.kind === "hold" ? `<p class="act-ask">“${m.ask}”</p>` : ""}`;
    const invitees =
      m.kind === "invitee"
        ? `<p class="invitees">${m.invitees.map((name) => `<span class="invitee">${name}</span>`).join("")}<span class="invitee invitee-new">+ ${m.add}</span></p>`
        : "";
    card.innerHTML = `<p class="action-tag">${ICONS[m.kind]}${KINDS[m.kind]}</p><p class="act-title">${m.title}</p>${detail}${invitees}<p class="act-from">${ICONS.mail}${m.from}</p><div class="act-btns"><span class="act-btn act-no">${ICONS.no}</span><span class="act-btn act-yes">${ICONS.yes}</span></div>`;
    stage.querySelector(".stage-deck").append(card);
    return card;
  });
  summary.innerHTML = `<span class="summary-pill summary-yes">${ICONS.yes}${MAILS.length - 1} approved</span><span class="summary-pill summary-no">${ICONS.no}1 declined</span>`;

  let anims = [];
  /** Length of the whole sequence (`ms`) */
  let total = 0;
  /** The still frame for reduced motion: emails left on the pile beside the deck (`ms`) */
  let stillAt = 0;

  const tf = (x, y, r = 0, s = 1, ry = 0) =>
    `translate(${x}px, ${y}px) perspective(900px) rotateY(${ry}deg) rotate(${r}deg) scale(${s})`;
  const pointer = (p) => `translate(${p.x}px, ${p.y}px) scale(${p.s})`;
  // Every animation is created paused; run() and hold() set them all going
  // or stopped at one time. Each is persisted, because the browser otherwise
  // discards a finished animation that a later one overrides, and replaying
  // from the start would then find it gone.
  const at = (element, keyframes, delay, duration, easing, fill = "forwards") => {
    const animation = element.animate(keyframes, { delay, duration, easing, fill });
    animation.pause();
    animation.persist();
    anims.push(animation);
  };

  // Lays the sequence out for the stage's current size. A card's first
  // animation fills backwards too, which keeps it hidden until it arrives;
  // each later one starts where the one before it left off.
  const build = () => {
    for (const animation of anims) animation.cancel();
    anims = [];
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const mw = mails[0].offsetWidth;
    const mh = mails[0].offsetHeight;
    const aw = acts[0].offsetWidth;
    const ah = acts[0].offsetHeight;
    const k = mw / 300;
    const n = MAILS.length;
    const deckX = (W - aw) / 2;
    const deckY = (H - ah) / 2;

    // The pile runs from the content column's left edge to just inside the
    // window's right edge, the slow emails spaced wider than the rush.
    const left = guide.offsetLeft;
    const span = Math.max(0, W - (W < 600 ? 12 : 24) - mw - left);
    const steps = MAILS.map((_, i) => (i === 0 ? 0 : i < SLOW ? 2.2 : 1));
    const stepsTotal = steps.reduce((sum, step) => sum + step, 0);
    let travelled = 0;
    const pile = SCATTER.map(([sx, sy, r], i) => {
      travelled += steps[i];
      return { x: left + (span * travelled) / stepsTotal + sx * k, y: (H - mh) / 2 + sy * k, r };
    });
    // Gathered, the pile shrinks a little and sits just left of the deck,
    // running off the window's edge where the stage is too narrow for both.
    const shrink = 0.88;
    const spread = 32 * k;
    const gatherLeft = deckX - (W < 600 ? 16 : 40) - mw * shrink - spread;
    const gathered = SCATTER.map(([sx, sy, r], i) => ({
      x: gatherLeft - (mw * (1 - shrink)) / 2 + (spread * i) / (n - 1) + sx * 0.5 * k,
      y: (H - mh) / 2 + sy * 0.6 * k,
      r: r * 0.85,
    }));
    const deck = SCATTER.map(([sx, , , r]) => ({ x: deckX + sx * 0.25 * k, y: deckY, r }));

    // 1. The emails land.
    let t = 500;
    mails.forEach((mail, i) => {
      const slow = i < SLOW;
      const p = pile[i];
      at(mail, [
        { transform: tf(p.x - 24 * k, p.y - 70 * k, p.r - 9, 1.06), opacity: 0 },
        { transform: tf(p.x, p.y, p.r), opacity: 1 },
      ], t, slow ? 650 : 280, DROP, "both");
      at(mail.querySelector("mark"), [{ backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%" }],
        t + (slow ? 450 : 120), slow ? 600 : 200, "ease-out", "both");
      if (i < n - 1) t += i < SLOW - 1 ? 1500 : i === SLOW - 1 ? 1800 : 130;
    });

    // 2. The pile gathers to the left.
    t += 280 + 650;
    mails.forEach((mail, i) => {
      const from = pile[i];
      const to = gathered[i];
      at(mail, [{ transform: tf(from.x, from.y, from.r) }, { transform: tf(to.x, to.y, to.r, shrink) }], t + i * 14, 850, MOVE);
    });

    // 3. Newest first, each email flies over the deck and turns over into its
    // action card. The rush goes first and overlaps; then a beat, which is the
    // still frame, and the four slow ones.
    t += 850 + 14 * n + 250;
    const overX = deckX + (aw - mw) / 2;
    const overY = deckY + (ah - mh) / 2;
    for (let i = n - 1; i >= 0; i--) {
      const slow = i < SLOW;
      const fly = slow ? 560 : 420;
      const flip = slow ? 260 : 200;
      const g = gathered[i];
      at(mails[i], [
        { transform: tf(g.x, g.y, g.r, shrink), opacity: 1 },
        { transform: tf((g.x + overX) / 2, Math.min(g.y, overY) - 30 * k, 0, 1.05), opacity: 1, offset: 0.45 },
        { transform: tf(overX, overY), opacity: 1, offset: 0.78 },
        { transform: tf(overX, overY, 0, 1, 90), opacity: 1, offset: 0.999 },
        { transform: tf(overX, overY, 0, 1, 90), opacity: 0 },
      ], t, fly, "ease-in-out");
      const d = deck[i];
      at(acts[i], [
        { transform: tf(d.x, d.y, d.r, 1, -90), opacity: 0 },
        { transform: tf(d.x, d.y, d.r, 1, -90), opacity: 1, offset: 0.001 },
        { transform: tf(d.x, d.y, d.r), opacity: 1 },
      ], t + fly, flip, "cubic-bezier(0.2, 0.7, 0.3, 1)", "both");
      if (i === SLOW) {
        stillAt = t + fly + flip + 200;
        t += fly + flip + 400;
      } else if (i > 0) {
        t += slow ? 560 : 150;
      } else {
        t += fly + flip + 500;
      }
    }

    // 4. The review. The top card straightens, the cursor takes it, drags it
    // past the threshold (its ✓ or ✕ lights up) and lets go, and the card is
    // thrown off the stage.
    // The cursor takes each card by the blank space right of its sender line
    // and drags it half its width, or less where that would carry the lit ✓
    // or ✕ off a narrow stage.
    const grab = { x: deckX + aw * 0.66, y: deckY + ah * 0.7, s: 1 };
    const reach = Math.min(aw * 0.5, deckX + 4);
    let hand = { x: W / 2 + aw * 0.95, y: H + 30, s: 1 };
    const moveHand = (to, delay, duration, easing = MOVE) => {
      at(cursor, [{ transform: pointer(hand) }, { transform: pointer(to) }], delay, duration, easing);
      hand = to;
    };
    at(cursor, [{ transform: pointer(hand), opacity: 0 }, { transform: pointer(hand), opacity: 1 }], t - 200, 200, "linear", "both");
    acts.forEach((card, i) => {
      const slow = i < SLOW;
      const dir = i === DECLINED ? -1 : 1;
      const d = deck[i];
      at(card, [{ transform: tf(d.x, d.y, d.r) }, { transform: tf(deckX, deckY) }], t, slow ? 300 : 120, MOVE);
      t += slow ? (i === 0 ? 700 : 450) : 40;
      moveHand(grab, t, slow ? 560 : 170);
      t += slow ? 560 : 170;
      moveHand({ ...grab, s: 0.86 }, t, slow ? 120 : 50, "ease-out");
      at(press, [
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(0.3)`, opacity: 0.9 },
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(1.5)`, opacity: 0 },
      ], t, 450, "ease-out", "none");
      t += slow ? 160 : 50;
      const dx = dir * reach;
      const dy = 10 * k;
      const drag = slow ? 620 : 180;
      at(card, [{ transform: tf(deckX, deckY) }, { transform: tf(deckX + dx, deckY + dy, dir * 9) }], t, drag, DRAG);
      moveHand({ x: grab.x + dx, y: grab.y + dy, s: 0.86 }, t, drag, DRAG);
      at(card.querySelector(dir > 0 ? ".act-yes" : ".act-no"), [{
        backgroundColor: dir > 0 ? "#1f4fd1" : "#0f1b2d",
        borderColor: dir > 0 ? "#1f4fd1" : "#0f1b2d",
        color: "#fff",
        transform: "scale(1.12)",
      }], t + drag * 0.45, slow ? 200 : 90, "ease-out");
      t += drag;
      moveHand({ ...hand, s: 1 }, t, 100, "ease-out");
      at(card, [
        { transform: tf(deckX + dx, deckY + dy, dir * 9) },
        { transform: tf(deckX + dir * (W / 2 + aw + 80), deckY + dy + 80 * k, dir * 28) },
      ], t, slow ? 420 : 260, THROW);
      t += slow ? 260 : 30;
    });

    // 5. The tally.
    at(cursor, [{ opacity: 1 }, { opacity: 0 }], t + 150, 300, "ease-in");
    at(summary, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], t + 350, 500, DROP, "both");
    total = t + 1050;
  };

  let started = false;
  let running = false;
  /** Timeline time at which the sequence was at 0 while running (`ms`) */
  let origin = 0;
  /** Where the sequence is stopped while not running (`ms`) */
  let heldAt = 0;
  let endTimer = 0;

  const setState = (state) => {
    demo.dataset.state = state;
    const labels = {
      playing: "Pause animation",
      paused: "Play animation",
      ready: "Play animation",
      ended: "Replay animation",
    };
    toggle.setAttribute("aria-label", labels[state]);
    toggle.title = labels[state];
  };
  const clock = () => (running ? document.timeline.currentTime - origin : heldAt);

  const hold = (ms) => {
    window.clearTimeout(endTimer);
    running = false;
    heldAt = ms;
    for (const animation of anims) {
      animation.pause();
      animation.currentTime = ms;
    }
  };
  // Setting the start time, unlike play(), never rewinds an animation that
  // has already finished.
  const run = (ms) => {
    started = true;
    running = true;
    origin = document.timeline.currentTime - ms;
    for (const animation of anims) animation.startTime = origin;
    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(() => {
      hold(total);
      setState("ended");
    }, total - ms);
    setState("playing");
  };

  build();
  const autoplay = !reduceMotion.matches && "IntersectionObserver" in window;
  hold(autoplay ? 0 : stillAt);
  setState("ready");

  toggle.addEventListener("click", () => {
    const state = demo.dataset.state;
    if (state === "playing") {
      hold(clock());
      setState("paused");
    } else if (state === "paused") run(heldAt);
    else run(0);
  });

  let width = stage.clientWidth;
  new ResizeObserver(() => {
    if (stage.clientWidth === width) return;
    width = stage.clientWidth;
    const ms = clock();
    const wasRunning = running;
    build();
    if (wasRunning) run(ms);
    else hold(ms);
  }).observe(stage);

  if (autoplay) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (!started) run(0);
      },
      { threshold: 0.4 },
    );
    observer.observe(stage);
  }
}
