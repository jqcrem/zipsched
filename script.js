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

  // In arrival order. The first SLOW arrive one at a time and the rest rush
  // in; every resulting suggestion is reviewed at the same pace. Names and
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
  // The second card is the only rejection among the first four. Three more
  // rejections are mixed into the remaining cards.
  const DECLINED = new Set([1, 5, 8, 12]);
  // Hand-set mess, one row per email: x and y offset on the pile (`px` at
  // desktop size), its tilt there (`deg`), and the slighter tilt of its card
  // on the deck (`deg`).
  const SCATTER = [
    [0, -18, -4, -1.5], [8, 22, 3.5, 2], [-6, -30, -2, -1], [10, 14, 5, 1.5],
    [-4, -6, -6, -2], [6, 30, 2.5, 1], [-10, -24, 7, -1.5], [4, 8, -3, 2.5],
    [-8, 26, 4.5, -2], [12, -14, -5.5, 1], [-2, 18, 1.5, -2.5], [6, -28, -7, 1.5],
    [-6, 4, 3, -1], [0, -8, -1.5, 2],
  ];
  // Random-looking horizontal positions for the rush, kept stable so replay
  // and responsive rebuilds reproduce the same pile.
  const RUSH_X = [0.08, 0.72, 0.36, 0.93, 0.18, 0.59, 0.02, 0.84, 0.47, 0.28];
  const DROP = "cubic-bezier(0.2, 0.8, 0.25, 1)";
  const MOVE = "cubic-bezier(0.45, 0, 0.25, 1)";
  const DRAG = "cubic-bezier(0.4, 0, 0.3, 1)";
  const THROW = "cubic-bezier(0.55, 0, 0.85, 0.4)";

  const stage = demo.querySelector(".stage");
  const guide = stage.querySelector(".stage-guide");
  const threadPane = stage.querySelector(".stage-thread");
  const calendarPane = stage.querySelector(".stage-calendar");
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
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const dayNumbers = [19, 20, 21, 22, 23];
  const cleanAsk = (ask) => ask.replace(/<\/?mark>/g, "");
  const activeDay = (m) => (m.when || m.times[0]).split(" ·")[0];
  const emailAddress = (name) => `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`;
  const renderContext = (index) => {
    if (index < 0 || index >= MAILS.length) {
      threadPane.replaceChildren();
      calendarPane.replaceChildren();
      return;
    }
    const m = MAILS[index];
    const replyName = m.from === "Alex Rivera" ? "Sam Carter" : "Alex Rivera";
    const replyEmail = replyName === "Alex Rivera" ? "alex@company.com" : "sam@company.com";
    const messages = [
      { name: m.from, email: emailAddress(m.from), at: m.at, body: cleanAsk(m.ask) },
      { name: replyName, email: replyEmail, at: "a few min later", body: "Looping in my EA to coordinate." },
    ];
    const panel = document.createElement("article");
    panel.className = "context-panel thread-panel";
    panel.innerHTML = `<span class="context-icon">${ICONS.mail}</span><p class="thread-subject">${m.meta}</p><ol class="thread-list">${messages.map((message) => `<li><p class="thread-sender"><strong>${message.name}</strong><span class="thread-time">${message.at}</span></p><p class="thread-email">${message.email}</p><p class="thread-message-copy">${message.body}</p></li>`).join("")}</ol>`;
    threadPane.replaceChildren(panel);

    const calendar = document.createElement("article");
    const selectedDay = activeDay(m);
    const eventTime = m.when || m.times[0];
    const eventTitle = m.kind === "times" ? "Available time" : m.title;
    calendar.className = "context-panel calendar-panel";
    const dayStrip = days.map((day, dayIndex) => {
      const activeClass = day === selectedDay ? " is-active" : "";
      return `<span class="calendar-day${activeClass}">${day}<span>${dayNumbers[dayIndex]}</span></span>`;
    }).join("");
    const proposedTop = 41 + (index % 2) * 36;
    calendar.innerHTML = `<span class="context-icon">${ICONS.hold}</span><div class="calendar-days">${dayStrip}</div><div class="calendar-grid"><div class="calendar-hour"><span>9 AM</span></div><div class="calendar-hour"><span>12 PM</span></div><div class="calendar-hour"><span>3 PM</span></div><div class="calendar-event calendar-event-muted" style="top:4px">Prep<span>9:00</span></div><div class="calendar-event is-proposed" style="top:${proposedTop}px"><strong>${eventTitle}</strong><span>${eventTime}</span></div><div class="calendar-event calendar-event-muted" style="top:116px">Team sync<span>4:00</span></div></div>`;
    calendarPane.replaceChildren(calendar);
  };
  // The deck is built newest email first, so the first email's card ends up
  // on top: each card sits above every card for a later email.
  const acts = MAILS.map((m, i) => {
    const card = document.createElement("article");
    card.className = "act";
    card.style.zIndex = String(MAILS.length - i);
    const detail =
      m.kind === "times"
        ? `<ul class="act-times mono">${m.times.map((time) => `<li>${time}</li>`).join("")}</ul>`
        : `<p class="act-when mono">${m.when}</p>`;
    const invitees =
      m.kind === "invitee"
        ? `<p class="invitees">${m.invitees.map((name) => `<span class="invitee">${name}</span>`).join("")}<span class="invitee invitee-new">+ ${m.add}</span></p>`
        : "";
    card.innerHTML = `<p class="action-tag">${ICONS[m.kind]}${KINDS[m.kind]}</p><p class="act-title">${m.title}</p>${detail}${invitees}<div class="act-btns"><button type="button" class="act-btn act-no" aria-label="Decline suggestion">${ICONS.no}</button><button type="button" class="act-btn act-yes" aria-label="Approve suggestion">${ICONS.yes}</button></div>`;
    stage.querySelector(".stage-deck").append(card);
    return card;
  });
  summary.innerHTML = `<span class="summary-pill summary-yes">${ICONS.yes}${MAILS.length - DECLINED.size} approved</span><span class="summary-pill summary-no">${ICONS.no}${DECLINED.size} declined</span>`;

  let anims = [];
  let manualAnims = [];
  let actRevealAnims = [];
  /** Length of the whole sequence (`ms`) */
  let total = 0;
  let interactiveAt = Infinity;
  let interactiveLayout = null;
  let interactiveIndex = -1;
  let interactionLocked = false;
  let interactionTimer = 0;
  const decisions = new Map();
  let contextStartsAt = Infinity;
  let contextEndsAt = Infinity;
  let contextSwitches = [];
  let currentContextIndex = -2;
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
    return animation;
  };

  const clearButtonState = (card) => {
    for (const button of card.querySelectorAll(".act-btn")) {
      button.style.backgroundColor = "";
      button.style.borderColor = "";
      button.style.color = "";
      button.style.transform = "";
    }
  };

  const showDecision = (card, direction, active = true) => {
    clearButtonState(card);
    if (!active) return;
    const button = card.querySelector(direction > 0 ? ".act-yes" : ".act-no");
    button.style.backgroundColor = direction > 0 ? "#1f4fd1" : "#dc2626";
    button.style.borderColor = direction > 0 ? "#1f4fd1" : "#dc2626";
    button.style.color = "#fff";
    button.style.transform = "scale(1.12)";
  };

  const updateSummary = () => {
    let approved = 3;
    let declined = 1;
    for (const decision of decisions.values()) {
      if (decision > 0) approved += 1;
      else declined += 1;
    }
    summary.innerHTML = `<span class="summary-pill summary-yes">${ICONS.yes}${approved} approved</span><span class="summary-pill summary-no">${ICONS.no}${declined} declined</span>`;
  };

  const syncContext = (ms) => {
    let nextIndex = -1;
    if (ms >= contextStartsAt && ms < contextEndsAt) {
      nextIndex = 0;
      for (const change of contextSwitches) {
        if (ms < change.at) break;
        nextIndex = change.index;
      }
    }
    if (nextIndex === currentContextIndex) return;
    currentContextIndex = nextIndex;
    renderContext(nextIndex);
  };

  // Lays the sequence out for the stage's current size. A card's first
  // animation fills backwards too, which keeps it hidden until it arrives;
  // each later one starts where the one before it left off.
  const build = () => {
    for (const animation of anims) animation.cancel();
    for (const animation of manualAnims) animation.cancel();
    window.clearTimeout(interactionTimer);
    anims = [];
    manualAnims = [];
    actRevealAnims = [];
    interactiveAt = Infinity;
    interactiveLayout = null;
    interactiveIndex = -1;
    interactionLocked = false;
    contextStartsAt = Infinity;
    contextEndsAt = Infinity;
    contextSwitches = [];
    currentContextIndex = -2;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const mw = mails[0].offsetWidth;
    const mh = mails[0].offsetHeight;
    const aw = acts[0].offsetWidth;
    const ah = acts[0].offsetHeight;
    const k = mw / 300;
    const n = MAILS.length;
    const deckX = (W - aw) / 2;
    const deckY = W <= 600 ? 186 : W <= 900 ? 188 : (H - ah) / 2;

    // The first four emails spread across most of the stage. The rush lands
    // in irregular positions across the full width and piles over them.
    const left = guide.offsetLeft;
    const span = Math.max(0, W - (W < 600 ? 12 : 24) - mw - left);
    const pile = SCATTER.map(([sx, sy, r], i) => {
      const x = i < SLOW ? (0.9 * i) / (SLOW - 1) : RUSH_X[i - SLOW];
      return { x: left + span * x + sx * k, y: (H - mh) / 2 + sy * k, r };
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
    acts.forEach((card) => {
      card.classList.remove("is-interactive");
      card.style.opacity = "";
      card.style.transform = "";
      card.style.pointerEvents = "";
      card.removeAttribute("title");
      clearButtonState(card);
    });
    summary.style.opacity = "";
    summary.style.transform = "";

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
    // action card. Every card uses the same overlapping cadence.
    t += 850 + 14 * n + 250;
    stillAt = t;
    const overX = deckX + (aw - mw) / 2;
    const overY = deckY + (ah - mh) / 2;
    for (let i = n - 1; i >= 0; i--) {
      const fly = 420;
      const flip = 200;
      const g = gathered[i];
      at(mails[i], [
        { transform: tf(g.x, g.y, g.r, shrink), opacity: 1 },
        { transform: tf((g.x + overX) / 2, Math.min(g.y, overY) - 30 * k, 0, 1.05), opacity: 1, offset: 0.45 },
        { transform: tf(overX, overY), opacity: 1, offset: 0.78 },
        { transform: tf(overX, overY, 0, 1, 90), opacity: 1, offset: 0.999 },
        { transform: tf(overX, overY, 0, 1, 90), opacity: 0 },
      ], t, fly, "ease-in-out");
      const d = deck[i];
      actRevealAnims[i] = at(acts[i], [
        { transform: tf(d.x, d.y, d.r, 1, -90), opacity: 0 },
        { transform: tf(d.x, d.y, d.r, 1, -90), opacity: 1, offset: 0.001 },
        { transform: tf(d.x, d.y, d.r), opacity: 1 },
      ], t + fly, flip, "cubic-bezier(0.2, 0.7, 0.3, 1)", "both");
      if (i > 0) {
        t += 150;
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
    interactiveLayout = { W, aw, deckX, deckY, reach, k, deck };
    let hand = { x: W / 2 + aw * 0.95, y: H + 30, s: 1 };
    const moveHand = (to, delay, duration, easing = MOVE) => {
      at(cursor, [{ transform: pointer(hand) }, { transform: pointer(to) }], delay, duration, easing);
      hand = to;
    };
    contextStartsAt = t - 320;
    at(cursor, [{ transform: pointer(hand), opacity: 0 }, { transform: pointer(hand), opacity: 1 }], t - 200, 200, "linear", "both");
    at(threadPane, [{ opacity: 0, transform: W <= 900 ? "translate(-50%, 8px)" : "translateY(calc(-50% + 8px))" }, { opacity: 1, transform: W <= 900 ? "translate(-50%, 0)" : "translateY(-50%)" }], t - 320, 320, DROP, "both");
    at(calendarPane, [{ opacity: 0, transform: W <= 900 ? "translate(-50%, 8px)" : "translateY(calc(-50% + 8px))" }, { opacity: 1, transform: W <= 900 ? "translate(-50%, 0)" : "translateY(-50%)" }], t - 240, 320, DROP, "both");
    const reviewTiming = {
      straighten: 220,
      reveal: 260,
      cursor: 320,
      press: 90,
      drag: 420,
      throw: 320,
      overlap: 160,
    };
    acts.slice(0, SLOW).forEach((card, i) => {
      const dir = DECLINED.has(i) ? -1 : 1;
      const d = deck[i];
      at(card, [{ transform: tf(d.x, d.y, d.r) }, { transform: tf(deckX, deckY) }], t, reviewTiming.straighten, MOVE);
      t += reviewTiming.reveal;
      moveHand(grab, t, reviewTiming.cursor);
      t += reviewTiming.cursor;
      moveHand({ ...grab, s: 0.86 }, t, reviewTiming.press, "ease-out");
      at(press, [
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(0.3)`, opacity: 0.9 },
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(1.5)`, opacity: 0 },
      ], t, 450, "ease-out", "none");
      t += reviewTiming.press;
      const dx = dir * reach;
      const dy = 10 * k;
      const drag = reviewTiming.drag;
      at(card, [{ transform: tf(deckX, deckY) }, { transform: tf(deckX + dx, deckY + dy, dir * 9) }], t, drag, DRAG);
      moveHand({ x: grab.x + dx, y: grab.y + dy, s: 0.86 }, t, drag, DRAG);
      at(card.querySelector(dir > 0 ? ".act-yes" : ".act-no"), [{
        backgroundColor: dir > 0 ? "#1f4fd1" : "#dc2626",
        borderColor: dir > 0 ? "#1f4fd1" : "#dc2626",
        color: "#fff",
        transform: "scale(1.12)",
      }], t + drag * 0.45, 140, "ease-out");
      t += drag;
      moveHand({ ...hand, s: 1 }, t, 100, "ease-out");
      const throwDuration = reviewTiming.throw;
      at(card, [
        { transform: tf(deckX + dx, deckY + dy, dir * 9) },
        { transform: tf(deckX + dir * (W / 2 + aw + 80), deckY + dy + 80 * k, dir * 28) },
      ], t, throwDuration, THROW);
      const switchAt = t + reviewTiming.overlap;
      contextSwitches.push({ at: switchAt, index: i + 1 });
      t += reviewTiming.overlap;
    });

    // 5. After four examples, the cursor leaves and the remaining cards are
    // handed to the viewer. The timeline stops here until they decide.
    at(cursor, [{ opacity: 1 }, { opacity: 0 }], t, 220, "ease-in");
    interactiveAt = t + 220;
    total = interactiveAt;
  };

  let started = false;
  let running = false;
  /** Timeline time at which the sequence was at 0 while running (`ms`) */
  let origin = 0;
  /** Where the sequence is stopped while not running (`ms`) */
  let heldAt = 0;
  let endTimer = 0;
  let contextFrame = 0;

  const setState = (state) => {
    demo.dataset.state = state;
    const labels = {
      playing: "Pause animation",
      paused: "Play animation",
      ready: "Play animation",
      interactive: "Replay animation",
      ended: "Replay animation",
    };
    toggle.setAttribute("aria-label", labels[state]);
    toggle.title = labels[state];
  };
  const clock = () => (running ? document.timeline.currentTime - origin : heldAt);

  const hold = (ms) => {
    window.clearTimeout(endTimer);
    window.cancelAnimationFrame(contextFrame);
    running = false;
    heldAt = ms;
    for (const animation of anims) {
      animation.pause();
      animation.currentTime = ms;
    }
    syncContext(ms);
  };
  // Setting the start time, unlike play(), never rewinds an animation that
  // has already finished.
  const run = (ms) => {
    started = true;
    running = true;
    origin = document.timeline.currentTime - ms;
    for (const animation of anims) animation.startTime = origin;
    syncContext(ms);
    const watchContext = () => {
      if (!running) return;
      syncContext(clock());
      contextFrame = window.requestAnimationFrame(watchContext);
    };
    window.cancelAnimationFrame(contextFrame);
    contextFrame = window.requestAnimationFrame(watchContext);
    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(() => {
      hold(total);
      enterInteractive();
    }, total - ms);
    setState("playing");
  };

  let drag = null;
  const snapAnims = new WeakMap();

  const finishInteraction = () => {
    interactionLocked = true;
    interactiveIndex = -1;
    updateSummary();
    const fadeThread = threadPane.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-in", fill: "forwards" });
    const fadeCalendar = calendarPane.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-in", fill: "forwards" });
    const showSummary = summary.animate([
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "none" },
    ], { delay: 180, duration: 500, easing: DROP, fill: "forwards" });
    manualAnims.push(fadeThread, fadeCalendar, showSummary);
    setState("ended");
  };

  const activateInteractiveCard = () => {
    if (!interactiveLayout) return;
    const next = acts.findIndex((_, index) => index >= SLOW && !decisions.has(index));
    if (next < 0) {
      finishInteraction();
      return;
    }
    interactiveIndex = next;
    interactionLocked = false;
    const card = acts[next];
    card.classList.add("is-interactive");
    card.style.pointerEvents = "auto";
    card.style.opacity = "1";
    card.style.transform = tf(interactiveLayout.deckX, interactiveLayout.deckY);
    card.title = "Drag left to decline or right to approve";
    clearButtonState(card);
    renderContext(next);
    setState("interactive");
  };

  const completeChoice = (index, direction, draggedX = 0) => {
    if (interactionLocked || index !== interactiveIndex || !interactiveLayout) return;
    interactionLocked = true;
    drag = null;
    const card = acts[index];
    snapAnims.get(card)?.cancel();
    const { W, aw, deckX, deckY, reach, k } = interactiveLayout;
    const startX = draggedX || direction * reach;
    card.classList.remove("is-interactive");
    card.style.pointerEvents = "none";
    card.removeAttribute("title");
    showDecision(card, direction);
    const exit = card.animate([
      { transform: tf(deckX + startX, deckY + 10 * k, direction * 9), opacity: 1 },
      { transform: tf(deckX + direction * (W / 2 + aw + 80), deckY + 90 * k, direction * 28), opacity: 1 },
    ], { duration: 320, easing: THROW, fill: "forwards" });
    manualAnims.push(exit);
    decisions.set(index, direction);
    interactionTimer = window.setTimeout(activateInteractiveCard, 180);
  };

  const enterInteractive = () => {
    if (!interactiveLayout) return;
    interactionLocked = false;
    summary.style.opacity = "0";
    for (let i = SLOW; i < acts.length; i += 1) {
      actRevealAnims[i]?.cancel();
      const card = acts[i];
      card.classList.remove("is-interactive");
      card.style.pointerEvents = "none";
      card.style.transform = tf(interactiveLayout.deck[i].x, interactiveLayout.deck[i].y, interactiveLayout.deck[i].r);
      card.style.opacity = decisions.has(i) ? "0" : "1";
      clearButtonState(card);
    }
    activateInteractiveCard();
  };

  acts.forEach((card, index) => {
    card.addEventListener("pointerdown", (event) => {
      if (index !== interactiveIndex || interactionLocked || event.target.closest(".act-btn")) return;
      event.preventDefault();
      snapAnims.get(card)?.cancel();
      card.setPointerCapture(event.pointerId);
      drag = { pointerId: event.pointerId, startX: event.clientX, x: 0 };
      card.classList.add("is-dragging");
    });
    card.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId || index !== interactiveIndex || !interactiveLayout) return;
      const limit = interactiveLayout.W * 0.62;
      drag.x = Math.max(-limit, Math.min(limit, event.clientX - drag.startX));
      const rotation = (drag.x / interactiveLayout.reach) * 9;
      card.style.transform = tf(interactiveLayout.deckX + drag.x, interactiveLayout.deckY + 10 * interactiveLayout.k, rotation);
      const threshold = Math.min(96, interactiveLayout.aw * 0.3);
      showDecision(card, drag.x, Math.abs(drag.x) >= threshold * 0.55);
    });
    const endDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId || index !== interactiveIndex || !interactiveLayout) return;
      const releasedX = drag.x;
      drag = null;
      card.classList.remove("is-dragging");
      const threshold = Math.min(96, interactiveLayout.aw * 0.3);
      if (Math.abs(releasedX) >= threshold) {
        completeChoice(index, releasedX > 0 ? 1 : -1, releasedX);
        return;
      }
      clearButtonState(card);
      const snap = card.animate([
        { transform: card.style.transform },
        { transform: tf(interactiveLayout.deckX, interactiveLayout.deckY) },
      ], { duration: 220, easing: MOVE, fill: "forwards" });
      snapAnims.set(card, snap);
      snap.onfinish = () => {
        card.style.transform = tf(interactiveLayout.deckX, interactiveLayout.deckY);
        snap.cancel();
        snapAnims.delete(card);
      };
      manualAnims.push(snap);
    };
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
    card.querySelector(".act-no").addEventListener("click", () => completeChoice(index, -1));
    card.querySelector(".act-yes").addEventListener("click", () => completeChoice(index, 1));
  });

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
    else if (state === "interactive" || state === "ended") {
      decisions.clear();
      build();
      hold(0);
      run(0);
    } else run(0);
  });

  let width = stage.clientWidth;
  new ResizeObserver(() => {
    if (stage.clientWidth === width) return;
    width = stage.clientWidth;
    const ms = clock();
    const wasRunning = running;
    const state = demo.dataset.state;
    build();
    if (wasRunning) run(ms);
    else if (state === "interactive" || state === "ended") {
      hold(total);
      enterInteractive();
    }
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
