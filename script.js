document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Hero demo. Fourteen emails drop onto a messy pile, four slowly and then ten
// in a rush, spreading right until the pile nearly leaves the window. The pile
// gathers to the left, each email flies to a deck and turns over into the
// action it asks for. A cursor demonstrates four reviews, including choosing
// availability on the calendar, then the viewer edits and reviews the rest.
// Every guided move is a Web Animation scheduled from one shared
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
    edit: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    no: '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    yes: '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const KINDS = { hold: "New hold", times: "Send times", invitee: "Add invitee" };
  const PRINCIPAL_NAME = "Alex Rivera";

  // In arrival order. The first SLOW arrive one at a time and the rest rush
  // in; every resulting suggestion is reviewed at the same pace. Names and
  // times are fictional, and no two approved holds or offered times overlap.
  const MAILS = [
    { from: "Dana Whitfield", at: "9:02 AM", meta: "Board deck", ask: "Can we find <mark>45 minutes Thursday afternoon</mark>?",
      kind: "hold", title: "Board deck review", when: "Thu · 2:00–2:45 PM" },
    { from: "Marcus Bell", at: "9:14 AM", meta: "Coffee?", ask: "Could we grab <mark>coffee Friday at 8:30</mark>?",
      kind: "hold", title: "Coffee", when: "Fri · 8:30–9:00 AM" },
    { from: "Alex Rivera", at: "9:31 AM", meta: "to Jordan Lee · cc Sam (EA)", ask: "<mark>Cc’ing my EA</mark> to find us a time next week.",
      kind: "times", title: "Re: Intro, Alex / Jordan", times: ["Tue · 10:00–10:30 AM", "Wed · 11:00–11:30 AM", "Thu · 10:30–11:30 AM"] },
    { from: "Alex Rivera", at: "9:47 AM", meta: "Investor call", ask: "Can you <mark>add Tim to Thursday’s call</mark>? He’s joining from the fund.",
      kind: "invitee", title: "Investor call", when: "Thu · 3:30–4:00 PM", invitees: ["Alex Rivera", "Priya Shah"], add: "Tim Okafor" },
    { from: "Priya Shah", at: "10:03 AM", meta: "Lunch", ask: "<mark>Lunch next Tuesday</mark> at 12:30?",
      kind: "hold", title: "Lunch", when: "Tue · 12:30–1:30 PM" },
    { from: "Jordan Lee", at: "10:05 AM", meta: "Catching up", ask: "What works for <mark>a call next week</mark>?",
      kind: "times", title: "Call with Jordan Lee", times: ["Mon · 2:00–2:30 PM", "Tue · 4:00–4:30 PM", "Wed · 9:30–10:00 AM"], eaReply: "Looping in my EA to coordinate." },
    { from: "Lena Fischer", at: "10:08 AM", meta: "Contract review", ask: "Please <mark>loop in Maya</mark> from legal.",
      kind: "invitee", title: "Contract review", when: "Wed · 1:00–1:45 PM", invitees: ["Lena Fischer", "Alex Rivera"], add: "Maya Chen" },
    { from: "Omar Haddad", at: "10:12 AM", meta: "Dinner", ask: "<mark>Dinner Thursday at 7</mark>?",
      kind: "hold", title: "Dinner", when: "Thu · 7:00–9:00 PM" },
    { from: "Chris Novak", at: "10:15 AM", meta: "Demo", ask: "Send me <mark>a few times for a demo</mark>.",
      kind: "times", title: "Demo for Chris Novak", times: ["Tue · 1:30–2:00 PM", "Wed · 11:30 AM–12:00 PM", "Fri · 11:00–11:30 AM"] },
    { from: "Dana Whitfield", at: "10:19 AM", meta: "Board deck review", ask: "Can we <mark>add Raj</mark> to the board deck review?",
      kind: "invitee", title: "Board deck review", when: "Thu · 2:00–2:45 PM", invitees: ["Dana Whitfield", "Alex Rivera"], add: "Raj Patel" },
    { from: "Grace Liu", at: "10:22 AM", meta: "Q4 review", ask: "<mark>Quarterly review, 60 min</mark>, Wednesday?",
      kind: "hold", title: "Quarterly review", when: "Wed · 3:00–4:00 PM" },
    { from: "Ben Carter", at: "10:26 AM", meta: "Intro", ask: "<mark>Intro call Monday at 9</mark>?",
      kind: "hold", title: "Intro call", when: "Mon · 9:00–9:30 AM" },
    { from: "Nadia Park", at: "10:31 AM", meta: "Weekly sync", ask: "Please <mark>include Theo</mark> on Friday’s sync.",
      kind: "invitee", title: "Weekly sync", when: "Fri · 10:00–10:30 AM", invitees: ["Nadia Park", "Alex Rivera"], add: "Theo Grant" },
    { from: "Hannah Moss", at: "10:34 AM", meta: "Team time", ask: "Can we find <mark>30 minutes with the team</mark>?",
      kind: "times", title: "Team check-in", times: ["Mon · 3:00–3:30 PM", "Tue · 11:00–11:30 AM", "Thu · 4:30–5:00 PM"], eaReply: "Looping in my EA to coordinate." },
  ];
  const SLOW = 4;
  // The second card is the only rejection among the first four. Three more
  // rejections are mixed into the remaining cards.
  const DECLINED = new Set([1, 5, 8, 12]);
  const HOLD_OPTIONS = {
    0: ["Thu · 2:00–2:45 PM", "Thu · 3:00–3:45 PM", "Fri · 9:30–10:15 AM"],
    1: ["Fri · 8:30–9:00 AM", "Fri · 9:30–10:00 AM", "Mon · 8:30–9:00 AM"],
    4: ["Tue · 12:30–1:30 PM", "Tue · 1:30–2:30 PM", "Wed · 12:00–1:00 PM"],
    7: ["Thu · 7:00–9:00 PM", "Fri · 6:30–8:30 PM", "Sat · 7:00–9:00 PM"],
    10: ["Wed · 3:00–4:00 PM", "Thu · 11:00 AM–12:00 PM", "Fri · 2:00–3:00 PM"],
    11: ["Mon · 9:00–9:30 AM", "Mon · 10:30–11:00 AM", "Tue · 9:00–9:30 AM"],
  };
  const initialEdits = () => MAILS.map((mail) => ({
    title: mail.title,
    when: mail.when ?? "",
    times: [...(mail.times ?? [])],
    message: mail.kind === "times"
      ? `Hey ${mail.from.split(" ")[0]},\nThese times work for ${PRINCIPAL_NAME}:`
      : "",
    invitees: mail.kind === "invitee"
      ? [...mail.invitees, mail.add]
      : mail.kind === "hold"
        ? [mail.from]
        : [],
  }));
  let cardEdits = initialEdits();
  const editSnapshots = new Map();
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
  const escapeHTML = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const activeDay = (value) => value.split(" ·")[0];
  const CALENDAR_START_MINUTES = 8 * 60;
  const CALENDAR_END_MINUTES = 20 * 60;
  const CALENDAR_GUTTER = 38;
  const SNAP_MINUTES = 15;
  const parseClock = (value, fallbackMeridiem = "AM") => {
    const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2] ?? 0);
    const meridiem = (match[3] ?? fallbackMeridiem).toUpperCase();
    if (hour === 12) hour = 0;
    if (meridiem === "PM") hour += 12;
    return hour * 60 + minute;
  };
  const parseCalendarRange = (value) => {
    const [dayLabel, rawRange] = value.split(" · ");
    const day = days.indexOf(dayLabel);
    if (day < 0 || !rawRange) return null;
    const [rawStart, rawEnd] = rawRange.split("–");
    if (!rawStart || !rawEnd) return null;
    const endMeridiem = rawEnd.trim().match(/(AM|PM)$/i)?.[1] ?? "AM";
    const start = parseClock(rawStart, endMeridiem);
    const end = parseClock(rawEnd, endMeridiem);
    if (start === null || end === null) return null;
    return { day, start, end: Math.max(start + SNAP_MINUTES, end) };
  };
  const clockParts = (minutes) => {
    const normalized = (minutes + 1440) % 1440;
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    return {
      clock: `${hour24 % 12 || 12}:${String(minute).padStart(2, "0")}`,
      meridiem: hour24 >= 12 ? "PM" : "AM",
    };
  };
  const formatCalendarRange = ({ day, start, end }) => {
    const from = clockParts(start);
    const to = clockParts(end);
    const startLabel = from.meridiem === to.meridiem
      ? from.clock
      : `${from.clock} ${from.meridiem}`;
    return `${days[day]} · ${startLabel}–${to.clock} ${to.meridiem}`;
  };
  const extendCalendarRange = (value, minutes = 30) => {
    const range = parseCalendarRange(value);
    return range ? formatCalendarRange({ ...range, end: Math.min(CALENDAR_END_MINUTES, range.end + minutes) }) : value;
  };
  const calendarMetrics = (compact, viewStart = CALENDAR_START_MINUTES, viewEnd = CALENDAR_END_MINUTES) => {
    const height = compact ? 168 : 216;
    return { height, pixelsPerMinute: height / (viewEnd - viewStart) };
  };
  const blockStyle = (
    range,
    compact,
    minimumHeight = 18,
    viewStart = CALENDAR_START_MINUTES,
    viewEnd = CALENDAR_END_MINUTES,
  ) => {
    const { height, pixelsPerMinute } = calendarMetrics(compact, viewStart, viewEnd);
    const visibleStart = Math.max(viewStart, range.start);
    const visibleEnd = Math.min(viewEnd, range.end);
    const top = Math.max(0, (visibleStart - viewStart) * pixelsPerMinute);
    const rawHeight = Math.max(minimumHeight, (visibleEnd - visibleStart) * pixelsPerMinute);
    return `--calendar-day:${range.day};top:${Math.min(height - minimumHeight, top)}px;height:${Math.min(height - top, rawHeight)}px`;
  };
  const holdCalendarView = (value) => {
    const range = parseCalendarRange(value);
    const windowMinutes = 6 * 60;
    const midpoint = range ? (range.start + range.end) / 2 : 13 * 60;
    const start = Math.max(0, Math.min(24 * 60 - windowMinutes, Math.floor((midpoint - windowMinutes / 2) / 60) * 60));
    return { start, end: start + windowMinutes, step: 60 };
  };
  const calendarHourLabel = (minutes) => {
    const { clock, meridiem } = clockParts(minutes);
    return `${clock.replace(":00", "")} ${meridiem}`;
  };
  const BUSY_EVENTS = [
    { day: 0, start: 8 * 60, end: 9 * 60, title: "Briefing" },
    { day: 0, start: 9 * 60, end: 10 * 60 + 30, title: "Board prep" },
    { day: 0, start: 10 * 60 + 30, end: 11 * 60 + 30, title: "Client call" },
    { day: 0, start: 12 * 60, end: 13 * 60, title: "Lunch" },
    { day: 0, start: 15 * 60 + 30, end: 16 * 60 + 30, title: "Finance" },
    { day: 0, start: 16 * 60 + 30, end: 18 * 60, title: "Counsel review" },
    { day: 1, start: 8 * 60, end: 9 * 60, title: "Breakfast" },
    { day: 1, start: 9 * 60, end: 10 * 60, title: "Pipeline" },
    { day: 1, start: 11 * 60 + 30, end: 12 * 60 + 30, title: "Staff 1:1" },
    { day: 1, start: 12 * 60 + 30, end: 13 * 60 + 30, title: "Lunch" },
    { day: 1, start: 14 * 60, end: 15 * 60 + 30, title: "Vendor review" },
    { day: 1, start: 16 * 60 + 45, end: 18 * 60 + 15, title: "Travel" },
    { day: 1, start: 18 * 60 + 15, end: 19 * 60 + 15, title: "Dinner" },
    { day: 2, start: 8 * 60, end: 8 * 60 + 45, title: "Metrics" },
    { day: 2, start: 8 * 60 + 45, end: 9 * 60 + 30, title: "Leadership" },
    { day: 2, start: 10 * 60, end: 11 * 60, title: "Candidate" },
    { day: 2, start: 12 * 60, end: 13 * 60, title: "Lunch" },
    { day: 2, start: 13 * 60, end: 14 * 60 + 30, title: "Design" },
    { day: 2, start: 14 * 60 + 30, end: 15 * 60 + 30, title: "Hiring debrief" },
    { day: 2, start: 16 * 60, end: 17 * 60 + 30, title: "Focus time" },
    { day: 2, start: 17 * 60 + 30, end: 18 * 60 + 30, title: "Research" },
    { day: 3, start: 8 * 60, end: 9 * 60, title: "Leadership" },
    { day: 3, start: 9 * 60, end: 10 * 60 + 30, title: "Ops review" },
    { day: 3, start: 12 * 60, end: 13 * 60, title: "Lunch" },
    { day: 3, start: 13 * 60, end: 14 * 60, title: "Partner 1:1" },
    { day: 3, start: 15 * 60, end: 16 * 60, title: "Team sync" },
    { day: 3, start: 16 * 60, end: 17 * 60, title: "Finance review" },
    { day: 3, start: 17 * 60, end: 18 * 60, title: "Travel" },
    { day: 3, start: 21 * 60 + 30, end: 22 * 60 + 30, title: "APAC call" },
    { day: 4, start: 9 * 60, end: 10 * 60, title: "Standup" },
    { day: 4, start: 10 * 60, end: 11 * 60, title: "Weekly review" },
    { day: 4, start: 11 * 60 + 30, end: 12 * 60 + 15, title: "Planning" },
    { day: 4, start: 12 * 60 + 15, end: 13 * 60 + 30, title: "Lunch" },
    { day: 4, start: 13 * 60 + 30, end: 15 * 60, title: "Focus time" },
    { day: 4, start: 15 * 60, end: 16 * 60 + 30, title: "Debrief" },
    { day: 4, start: 16 * 60 + 30, end: 18 * 60, title: "Wrap-up" },
  ];
  const emailAddress = (name) => `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`;
  const renderContext = (index, guidedSelectionCount = null) => {
    if (index < 0 || index >= MAILS.length) {
      threadPane.replaceChildren();
      calendarPane.replaceChildren();
      return;
    }
    const m = MAILS[index];
    const edit = cardEdits[index];
    const replyName = m.from === "Alex Rivera" ? "Sam Carter" : "Alex Rivera";
    const replyEmail = replyName === "Alex Rivera" ? "alex@company.com" : "sam@company.com";
    const messages = [
      { name: m.from, email: emailAddress(m.from), at: m.at, body: cleanAsk(m.ask) },
      ...(m.eaReply ? [{ name: replyName, email: replyEmail, at: "a few min later", body: m.eaReply }] : []),
    ];
    const recipient = m.kind === "times"
      ? `<p class="thread-recipient"><span>Reply to</span><strong>${escapeHTML(m.from)}</strong><span>${emailAddress(m.from)}</span></p>`
      : "";
    const panel = document.createElement("article");
    panel.className = "context-panel thread-panel";
    panel.innerHTML = `<p class="thread-subject"><span class="thread-subject-icon">${ICONS.mail}</span><span class="thread-subject-text">${m.meta}</span></p><ol class="thread-list">${messages.map((message) => `<li><p class="thread-sender"><strong>${message.name}</strong><span class="thread-time">${message.at}</span></p><p class="thread-email">${message.email}</p><p class="thread-message-copy">${message.body}</p></li>`).join("")}</ol>${recipient}`;
    threadPane.replaceChildren(panel);

    const calendar = document.createElement("article");
    const timeOptions = m.times ?? [];
    const selectedTimes = guidedSelectionCount === null
      ? edit.times
      : timeOptions.slice(0, guidedSelectionCount);
    const compactCalendar = stage.clientWidth <= 900;
    const displayedHoldTime = m.kind === "hold" && guidedSelectionCount === 1
      ? extendCalendarRange(edit.when)
      : edit.when;
    const firstSelected = m.kind === "times"
      ? (selectedTimes[0] ?? timeOptions[0] ?? "Mon · 9:00 AM")
      : (displayedHoldTime || "Mon · 9:00 AM");
    const selectedDay = activeDay(firstSelected);
    const selectedDayIndex = Math.max(0, days.indexOf(selectedDay));
    const singleDay = m.kind === "hold";
    const calendarView = singleDay
      ? holdCalendarView(displayedHoldTime)
      : { start: CALENDAR_START_MINUTES, end: CALENDAR_END_MINUTES, step: 120 };
    const timeDayIndexes = timeOptions
      .map(parseCalendarRange)
      .filter(Boolean)
      .map((range) => range.day);
    // Send-times suggestions stay focused on three consecutive days. Pick the
    // window containing the most proposed times, so the compact calendar still
    // shows the useful choices rather than an arbitrary slice of the week.
    const timeWindowStart = m.kind === "times"
      ? [0, 1, 2].reduce((bestStart, start) => {
        const bestCount = timeDayIndexes.filter((dayIndex) => dayIndex >= bestStart && dayIndex < bestStart + 3).length;
        const count = timeDayIndexes.filter((dayIndex) => dayIndex >= start && dayIndex < start + 3).length;
        return count > bestCount ? start : bestStart;
      }, 0)
      : 0;
    const visibleDays = singleDay
      ? [{ day: days[selectedDayIndex], dayIndex: selectedDayIndex }]
      : m.kind === "times"
        ? days.slice(timeWindowStart, timeWindowStart + 3).map((day, offset) => ({ day, dayIndex: timeWindowStart + offset }))
        : days.map((day, dayIndex) => ({ day, dayIndex }));
    const visibleDayIndexes = visibleDays.map(({ dayIndex }) => dayIndex);
    const layoutRange = (range) => {
      const column = visibleDayIndexes.indexOf(range.day);
      return column < 0 ? null : { ...range, day: column };
    };
    const blockStyleFor = (range, minimumHeight = 18) => {
      const layout = layoutRange(range);
      return layout ? blockStyle(layout, compactCalendar, minimumHeight, calendarView.start, calendarView.end) : "";
    };
    calendar.className = `context-panel calendar-panel${singleDay ? " is-single-day" : m.kind === "times" ? " is-three-day" : ""}`;
    calendar.dataset.dayStart = String(visibleDays[0].dayIndex);
    calendar.dataset.dayCount = String(visibleDays.length);
    const dayStrip = visibleDays.map(({ day, dayIndex }) => {
      const activeClass = day === selectedDay ? " is-active" : "";
      return `<span class="calendar-day${activeClass}">${day}<span>${dayNumbers[dayIndex]}</span></span>`;
    }).join("");
    const proposedValues = m.kind === "times"
      ? selectedTimes
      : m.kind === "hold" || m.kind === "invitee"
        ? [displayedHoldTime]
        : [];
    const proposalMarkup = proposedValues.map((value, blockIndex) => {
      const range = parseCalendarRange(value);
      if (!range) return "";
      if (!visibleDayIndexes.includes(range.day)) return "";
      const title = m.kind === "times" ? "" : `<strong>${escapeHTML(edit.title)}</strong>`;
      const removable = m.kind === "times"
        ? `<button type="button" class="calendar-block-remove" data-block-index="${blockIndex}" aria-label="Remove ${escapeHTML(value)}">${ICONS.no}</button>`
        : "";
      return `<div class="calendar-event calendar-proposal" data-block-index="${blockIndex}" style="${blockStyleFor(range)}">${title}<span>${escapeHTML(value.replace(`${days[range.day]} · `, ""))}</span>${removable}<span class="calendar-resize-handle" data-block-index="${blockIndex}" aria-hidden="true"></span></div>`;
    }).join("");
    const busyMarkup = BUSY_EVENTS.filter((event) => (
      visibleDayIndexes.includes(event.day)
      && event.end > calendarView.start
      && event.start < calendarView.end
    )).map((event) => {
      const start = clockParts(event.start);
      return `<div class="calendar-event calendar-event-muted" style="${blockStyleFor(event, 10)}"><strong>${escapeHTML(event.title)}</strong><span>${start.clock}</span></div>`;
    }).join("");
    const editable = demo.dataset.state === "interactive"
      && index === interactiveIndex
      && acts[index]?.classList.contains("is-editing");
    const hourLabels = Array.from(
      { length: Math.ceil((calendarView.end - calendarView.start) / calendarView.step) },
      (_, row) => calendarHourLabel(calendarView.start + row * calendarView.step),
    );
    calendar.innerHTML = `<div class="calendar-days">${dayStrip}</div><div class="calendar-grid${editable ? " is-directly-editable" : ""}" data-calendar-grid>${hourLabels.map((label) => `<div class="calendar-hour"><span>${label}</span></div>`).join("")}${busyMarkup}${proposalMarkup}</div>`;
    calendarPane.replaceChildren(calendar);
    if (!editable) return;

    calendar.querySelectorAll(".calendar-block-remove").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (m.kind !== "times") return;
        edit.times.splice(Number(button.dataset.blockIndex), 1);
        syncTimesCard(index);
        renderContext(index);
      });
    });

    const grid = calendar.querySelector("[data-calendar-grid]");
    const snapMinutes = (minutes) => Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
    const rangeFromPointer = (event) => {
      const rect = grid.getBoundingClientRect();
      const gutter = CALENDAR_GUTTER;
      const usableWidth = Math.max(1, rect.width - gutter);
      const daySlot = Math.max(0, Math.min(visibleDays.length - 1, Math.floor(((event.clientX - rect.left - gutter) / usableWidth) * visibleDays.length)));
      const day = visibleDays[daySlot].dayIndex;
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      const minutes = calendarView.start + snapMinutes((y / rect.height) * (calendarView.end - calendarView.start));
      return { day, minutes: Math.max(calendarView.start, Math.min(calendarView.end, minutes)) };
    };

    // Blue proposals are the editable calendar entries. Dragging one moves
    // the whole time range; gray events deliberately remain read-only.
    calendar.querySelectorAll(".calendar-proposal").forEach((proposal) => {
      proposal.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".calendar-block-remove, .calendar-resize-handle")) return;
        event.preventDefault();
        event.stopPropagation();
        const blockIndex = Number(proposal.dataset.blockIndex);
        const sourceValue = m.kind === "times" ? edit.times[blockIndex] : edit.when;
        const original = parseCalendarRange(sourceValue);
        if (!original) return;
        const origin = rangeFromPointer(event);
        proposal.setPointerCapture(event.pointerId);
        proposal.classList.add("is-moving");
        const move = (moveEvent) => {
          if (moveEvent.pointerId !== event.pointerId) return;
          const point = rangeFromPointer(moveEvent);
          const duration = original.end - original.start;
          const start = Math.max(
            calendarView.start,
            Math.min(calendarView.end - duration, original.start + point.minutes - origin.minutes),
          );
          const moved = {
            day: singleDay ? original.day : Math.max(visibleDays[0].dayIndex, Math.min(visibleDays.at(-1).dayIndex, original.day + point.day - origin.day)),
            start,
            end: start + duration,
          };
          proposal.setAttribute("style", blockStyleFor(moved));
          proposal.querySelector(":scope > span:not(.calendar-resize-handle)").textContent = formatCalendarRange(moved).split(" · ")[1];
        };
        const end = (endEvent) => {
          if (endEvent.pointerId !== event.pointerId) return;
          proposal.removeEventListener("pointermove", move);
          proposal.removeEventListener("pointerup", end);
          proposal.removeEventListener("pointercancel", end);
          proposal.classList.remove("is-moving");
          const point = rangeFromPointer(endEvent);
          const duration = original.end - original.start;
          const start = Math.max(
            calendarView.start,
            Math.min(calendarView.end - duration, original.start + point.minutes - origin.minutes),
          );
          const moved = {
            day: singleDay ? original.day : Math.max(visibleDays[0].dayIndex, Math.min(visibleDays.at(-1).dayIndex, original.day + point.day - origin.day)),
            start,
            end: start + duration,
          };
          const value = formatCalendarRange(moved);
          if (m.kind === "times") {
            edit.times[blockIndex] = value;
            edit.times.sort((left, right) => {
              const leftRange = parseCalendarRange(left);
              const rightRange = parseCalendarRange(right);
              return leftRange && rightRange ? leftRange.day - rightRange.day || leftRange.start - rightRange.start : 0;
            });
            syncTimesCard(index);
          } else {
            edit.when = value;
            acts[index].querySelector(".act-when").textContent = value;
          }
          renderContext(index);
        };
        proposal.addEventListener("pointermove", move);
        proposal.addEventListener("pointerup", end);
        proposal.addEventListener("pointercancel", end);
      });
    });

    if (m.kind === "times") {
      let creating = null;
      grid.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".calendar-event")) return;
        event.preventDefault();
        const point = rangeFromPointer(event);
        creating = {
          pointerId: event.pointerId,
          day: point.day,
          anchor: point.minutes,
          start: point.minutes,
          end: Math.min(CALENDAR_END_MINUTES, point.minutes + 30),
        };
        grid.setPointerCapture(event.pointerId);
        const draft = document.createElement("div");
        draft.className = "calendar-event calendar-proposal calendar-draft";
        draft.innerHTML = "<span></span>";
        grid.append(draft);
        creating.node = draft;
      });
      grid.addEventListener("pointermove", (event) => {
        if (!creating || creating.pointerId !== event.pointerId) return;
        const point = rangeFromPointer(event);
        const earlier = Math.min(creating.anchor, point.minutes);
        const later = Math.max(creating.anchor, point.minutes);
        if (later - earlier < 30) {
          creating.start = point.minutes < creating.anchor
            ? Math.max(CALENDAR_START_MINUTES, creating.anchor - 30)
            : creating.anchor;
          creating.end = point.minutes < creating.anchor
            ? creating.anchor
            : Math.min(CALENDAR_END_MINUTES, creating.anchor + 30);
        } else {
          creating.start = earlier;
          creating.end = later;
        }
        const range = { day: creating.day, start: creating.start, end: creating.end };
        creating.node.setAttribute("style", blockStyleFor(range));
        creating.node.querySelector("span").textContent = formatCalendarRange(range).split(" · ")[1];
      });
      const finishCreation = (event) => {
        if (!creating || creating.pointerId !== event.pointerId) return;
        const next = formatCalendarRange({ day: creating.day, start: creating.start, end: creating.end });
        creating = null;
        edit.times.push(next);
        edit.times.sort((a, b) => {
          const left = parseCalendarRange(a);
          const right = parseCalendarRange(b);
          return left && right ? left.day - right.day || left.start - right.start : 0;
        });
        syncTimesCard(index);
        renderContext(index);
      };
      grid.addEventListener("pointerup", finishCreation);
      grid.addEventListener("pointercancel", finishCreation);
    }

    calendar.querySelectorAll(".calendar-resize-handle").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const blockIndex = Number(handle.dataset.blockIndex);
        const sourceValue = m.kind === "times" ? edit.times[blockIndex] : edit.when;
        const original = parseCalendarRange(sourceValue);
        if (!original) return;
        const block = handle.closest(".calendar-proposal");
        handle.setPointerCapture(event.pointerId);
        const move = (moveEvent) => {
          const point = rangeFromPointer(moveEvent);
          const end = Math.max(original.start + SNAP_MINUTES, Math.min(calendarView.end, point.minutes));
          const range = { ...original, end };
          block.setAttribute("style", blockStyleFor(range));
          block.querySelector(":scope > span:not(.calendar-resize-handle)").textContent = formatCalendarRange(range).split(" · ")[1];
        };
        const end = (endEvent) => {
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", end);
          handle.removeEventListener("pointercancel", end);
          const point = rangeFromPointer(endEvent);
          const value = formatCalendarRange({ ...original, end: Math.max(original.start + SNAP_MINUTES, Math.min(calendarView.end, point.minutes)) });
          if (m.kind === "times") {
            edit.times[blockIndex] = value;
            syncTimesCard(index);
          } else {
            edit.when = value;
            acts[index].querySelector(".act-when").textContent = value;
          }
          renderContext(index);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", end);
        handle.addEventListener("pointercancel", end);
      });
    });
  };
  const inviteeMarkup = (mail, edit) => edit.invitees.length
    ? `<p class="invitees" aria-label="Invitees">${edit.invitees.map((name, inviteeIndex) => {
      const removable = mail.kind === "invitee"
        ? `<button type="button" class="invitee-remove act-control" data-invitee-index="${inviteeIndex}" aria-label="Remove ${escapeHTML(name)}" disabled>${ICONS.no}</button>`
        : "";
      return `<span class="invitee${name === mail.add ? " invitee-new" : ""}${mail.kind === "hold" ? " invitee-sender" : ""}"><span>${escapeHTML(name)}</span>${removable}</span>`;
    }).join("")}</p>`
    : "";
  // The deck is built newest email first, so the first email's card ends up
  // on top: each card sits above every card for a later email.
  const acts = MAILS.map((m, i) => {
    const card = document.createElement("article");
    card.className = `act act-kind-${m.kind}`;
    card.style.zIndex = String(MAILS.length - i);
    const edit = cardEdits[i];
    const title = m.kind === "hold"
      ? `<input class="act-title act-title-input act-control" aria-label="Event title" value="${escapeHTML(edit.title)}" readonly tabindex="-1">`
      : `<p class="act-title">${escapeHTML(edit.title)}</p>`;
    const detail = m.kind === "times"
      ? `<div class="act-times-editor"><textarea class="act-email-copy act-control" aria-label="Email text" readonly tabindex="-1">${escapeHTML(edit.message)}</textarea><ul class="act-times mono" aria-label="Proposed times">${edit.times.map((time) => `<li>${escapeHTML(time)}</li>`).join("")}</ul></div>`
      : `<p class="act-when mono">${escapeHTML(edit.when)}</p>`;
    const invitees = inviteeMarkup(m, edit);
    card.innerHTML = `<p class="action-tag">${ICONS[m.kind]}${KINDS[m.kind]}</p>${title}${detail}${invitees}<div class="act-btns"><button type="button" class="act-btn act-no act-control" aria-label="Decline suggestion">${ICONS.no}</button><div class="act-edit-menu"><button type="button" class="act-btn act-edit act-control" aria-label="Edit suggestion">${ICONS.edit}</button><span class="act-edit-confirm"><button type="button" class="act-edit-cancel act-control">Cancel</button><button type="button" class="act-edit-save act-control">Save</button></span></div><button type="button" class="act-btn act-yes act-control" aria-label="Approve suggestion">${ICONS.yes}</button></div>`;
    stage.querySelector(".stage-deck").append(card);
    return card;
  });
  const syncTimesCard = (index) => {
    const list = acts[index].querySelector(".act-times");
    if (!list) return;
    list.innerHTML = cardEdits[index].times.map((time) => `<li>${escapeHTML(time)}</li>`).join("");
  };
  const syncInviteesCard = (index) => {
    const card = acts[index];
    const markup = inviteeMarkup(MAILS[index], cardEdits[index]);
    const current = card.querySelector(".invitees");
    if (current) current.outerHTML = markup;
    else if (markup) card.querySelector(".act-btns").insertAdjacentHTML("beforebegin", markup);
  };
  const setCardEditing = (card, enabled) => {
    card.classList.toggle("is-editing", enabled);
    const title = card.querySelector(".act-title-input");
    const email = card.querySelector(".act-email-copy");
    if (title) {
      title.readOnly = !enabled;
      title.tabIndex = enabled ? 0 : -1;
    }
    if (email) {
      email.readOnly = !enabled;
      email.tabIndex = enabled ? 0 : -1;
    }
    card.querySelectorAll(".invitee-remove").forEach((button) => {
      button.disabled = !enabled;
    });
    card.querySelectorAll(".act-no, .act-yes").forEach((button) => {
      button.disabled = enabled;
    });
  };
  acts.forEach((card, index) => {
    const titleInput = card.querySelector(".act-title-input");
    titleInput?.addEventListener("input", () => {
      cardEdits[index].title = titleInput.value;
      if (index === interactiveIndex) renderContext(index);
    });
    const emailInput = card.querySelector(".act-email-copy");
    emailInput?.addEventListener("input", () => {
      cardEdits[index].message = emailInput.value;
    });
    card.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".invitee-remove");
      if (!removeButton || index !== interactiveIndex || !card.classList.contains("is-editing")) return;
      const inviteeName = removeButton.closest(".invitee").querySelector(":scope > span").textContent;
      const inviteeIndex = cardEdits[index].invitees.indexOf(inviteeName);
      if (inviteeIndex < 0) return;
      cardEdits[index].invitees.splice(inviteeIndex, 1);
      syncInviteesCard(index);
    });
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
  let contextSelectionSteps = [];
  let currentContextIndex = -2;
  let currentContextSelectionCount = -2;
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

  const snapshotEdit = (index) => ({
    ...cardEdits[index],
    times: [...cardEdits[index].times],
    invitees: [...cardEdits[index].invitees],
  });
  const restoreCardEdit = (index) => {
    const card = acts[index];
    const edit = cardEdits[index];
    const title = card.querySelector(".act-title-input");
    const email = card.querySelector(".act-email-copy");
    if (title) title.value = edit.title;
    if (email) email.value = edit.message;
    syncTimesCard(index);
    syncInviteesCard(index);
  };
  acts.forEach((card, index) => {
    card.querySelector(".act-edit").addEventListener("click", () => {
      if (index !== interactiveIndex || interactionLocked) return;
      editSnapshots.set(index, snapshotEdit(index));
      setCardEditing(card, true);
      renderContext(index);
    });
    card.querySelector(".act-edit-save").addEventListener("click", () => {
      if (index !== interactiveIndex || !card.classList.contains("is-editing")) return;
      editSnapshots.delete(index);
      setCardEditing(card, false);
      renderContext(index);
    });
    card.querySelector(".act-edit-cancel").addEventListener("click", () => {
      if (index !== interactiveIndex || !card.classList.contains("is-editing")) return;
      const snapshot = editSnapshots.get(index);
      if (snapshot) cardEdits[index] = snapshot;
      editSnapshots.delete(index);
      restoreCardEdit(index);
      setCardEditing(card, false);
      renderContext(index);
    });
  });

  const showDecision = (card, direction, active = true) => {
    clearButtonState(card);
    if (!active) return;
    const button = card.querySelector(direction > 0 ? ".act-yes" : ".act-no");
    button.style.backgroundColor = direction > 0 ? "#16a34a" : "#dc2626";
    button.style.borderColor = direction > 0 ? "#16a34a" : "#dc2626";
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
    let selectionCount = null;
    if (ms >= contextStartsAt && ms < contextEndsAt) {
      nextIndex = 0;
      for (const change of contextSwitches) {
        if (ms < change.at) break;
        nextIndex = change.index;
      }
      if (MAILS[nextIndex]?.kind === "times") {
        selectionCount = nextIndex < SLOW ? 0 : null;
        for (const change of contextSelectionSteps) {
          if (change.index !== nextIndex || ms < change.at) continue;
          selectionCount = change.count;
        }
      } else if (MAILS[nextIndex]?.kind === "hold" && nextIndex < SLOW) {
        selectionCount = 0;
        for (const change of contextSelectionSteps) {
          if (change.index !== nextIndex || ms < change.at) continue;
          selectionCount = change.count;
        }
      }
    }
    if (nextIndex === currentContextIndex && selectionCount === currentContextSelectionCount) return;
    currentContextIndex = nextIndex;
    currentContextSelectionCount = selectionCount;
    acts.forEach((card, index) => {
      const when = card.querySelector(".act-when");
      if (!when || MAILS[index].kind !== "hold") return;
      when.textContent = index === nextIndex && selectionCount === 1
        ? extendCalendarRange(cardEdits[index].when)
        : cardEdits[index].when;
    });
    renderContext(nextIndex, selectionCount);
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
    contextSelectionSteps = [];
    currentContextIndex = -2;
    currentContextSelectionCount = -2;
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
    // In the stacked mobile/tablet layout, keep rear cards flush. Their
    // rotation can otherwise expose action buttons below the front card.
    const deck = SCATTER.map(([sx, , , r]) => ({
      x: deckX + (W <= 900 ? 0 : sx * 0.25 * k),
      y: deckY,
      r: W <= 900 ? 0 : r,
    }));
    acts.forEach((card, index) => {
      card.classList.remove("is-interactive");
      card.style.opacity = "";
      card.style.transform = "";
      card.style.pointerEvents = "";
      card.removeAttribute("title");
      setCardEditing(card, false);
      clearButtonState(card);
      const when = card.querySelector(".act-when");
      if (when) when.textContent = cardEdits[index].when;
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
      at(mail, [{ transform: tf(from.x, from.y, from.r) }, { transform: tf(to.x, to.y, to.r, shrink) }], t + i * 8, 280, MOVE);
    });

    // 3. Newest first, each email briskly flies over the deck and turns over
    // into its action card. This transition is intentionally much quicker
    // than the guided review that follows it.
    t += 280 + 8 * n + 60;
    stillAt = t;
    const overX = deckX + (aw - mw) / 2;
    const overY = deckY + (ah - mh) / 2;
    for (let i = n - 1; i >= 0; i--) {
      const fly = 140;
      const flip = 80;
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
        t += 28;
      } else {
        t += fly + flip + 120;
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
    const calendarRangePoints = (blockIndex = 0) => {
      const block = calendarPane.querySelector(`.calendar-proposal[data-block-index="${blockIndex}"]`);
      if (!block) return null;
      const stageBounds = stage.getBoundingClientRect();
      const blockBounds = block.getBoundingClientRect();
      const scaleX = stageBounds.width / stage.clientWidth;
      const scaleY = stageBounds.height / stage.clientHeight;
      const x = ((blockBounds.left + blockBounds.right) / 2 - stageBounds.left) / scaleX;
      return {
        start: { x, y: (blockBounds.top - stageBounds.top) / scaleY, s: 1 },
        end: { x, y: (blockBounds.bottom - stageBounds.top) / scaleY, s: 0.86 },
      };
    };
    contextStartsAt = t - 320;
    at(cursor, [{ transform: pointer(hand), opacity: 0 }, { transform: pointer(hand), opacity: 1 }], t - 200, 200, "linear", "both");
    at(threadPane, [{ opacity: 0, transform: W <= 900 ? "translate(-50%, 8px)" : "translateY(calc(-50% + 8px))" }, { opacity: 1, transform: W <= 900 ? "translate(-50%, 0)" : "translateY(-50%)" }], t - 320, 320, DROP, "both");
    const calendarEntranceAt = t - 240;
    const reviewPace = 1.7;
    const reviewMs = (duration) => Math.round(duration * reviewPace);
    const reviewTiming = {
      straighten: reviewMs(220),
      reveal: reviewMs(260),
      cursor: reviewMs(320),
      press: reviewMs(90),
      drag: reviewMs(420),
      throw: reviewMs(320),
      overlap: reviewMs(160),
    };
    acts.slice(0, SLOW).forEach((card, i) => {
      const dir = DECLINED.has(i) ? -1 : 1;
      const d = deck[i];
      at(card, [
        { transform: tf(d.x, d.y, d.r), boxShadow: "none" },
        {
          transform: tf(deckX, deckY),
          boxShadow: "0 1px 2px rgb(15 27 45 / 0.06), 0 18px 40px -20px rgb(15 27 45 / 0.35)",
        },
      ], t, reviewTiming.straighten, MOVE);
      t += reviewTiming.reveal;

      // A created hold is edited in place: the cursor grabs its lower border
      // and lengthens it. This mirrors the direct manipulation available once
      // the guided cards are gone.
      if (MAILS[i].kind === "hold" && i === 0) {
        renderContext(i, 0);
        const points = calendarRangePoints();
        renderContext(i, 1);
        const resizedPoints = calendarRangePoints();
        renderContext(i, 0);
        if (points && resizedPoints) {
          moveHand(points.end, t, reviewMs(300));
          t += reviewMs(300);
          moveHand({ ...points.end, s: 0.82 }, t, reviewMs(70), "ease-out");
          at(press, [
            { transform: `translate(${points.end.x}px, ${points.end.y}px) scale(0.3)`, opacity: 0.9 },
            { transform: `translate(${points.end.x}px, ${points.end.y}px) scale(1.5)`, opacity: 0 },
          ], t, reviewMs(340), "ease-out", "none");
          t += reviewMs(70);
          moveHand(resizedPoints.end, t, reviewMs(360), DRAG);
          contextSelectionSteps.push({ at: t + reviewMs(300), index: i, count: 1 });
          t += reviewMs(400);
          moveHand({ ...hand, s: 1 }, t, reviewMs(80), "ease-out");
          t += reviewMs(80);
        }
      }

      // The guided Send times card demonstrates the same interaction the
      // viewer gets later: draw blocks directly across the calendar, watch the
      // bullets appear, then approve with the check button.
      if (MAILS[i].kind === "times") {
        renderContext(i, 0);
        const bulletItems = [...card.querySelectorAll(".act-times li")];
        bulletItems.forEach((item, optionIndex) => {
          renderContext(i, optionIndex + 1);
          const points = calendarRangePoints(optionIndex);
          if (!points) return;
          moveHand(points.start, t, reviewMs(260));
          t += reviewMs(260);
          moveHand({ ...points.start, s: 0.82 }, t, reviewMs(70), "ease-out");
          at(press, [
            { transform: `translate(${points.start.x}px, ${points.start.y}px) scale(0.3)`, opacity: 0.9 },
            { transform: `translate(${points.start.x}px, ${points.start.y}px) scale(1.5)`, opacity: 0 },
          ], t, reviewMs(360), "ease-out", "none");
          t += reviewMs(70);
          moveHand(points.end, t, reviewMs(340), DRAG);
          at(item, [
            { opacity: 0, transform: "translateY(3px)" },
            { opacity: 1, transform: "none" },
          ], t + reviewMs(300), reviewMs(150), DROP, "both");
          contextSelectionSteps.push({ at: t + reviewMs(300), index: i, count: optionIndex + 1 });
          t += reviewMs(380);
          moveHand({ ...hand, s: 1 }, t, reviewMs(60), "ease-out");
          t += reviewMs(70);
        });
        renderContext(i, 0);
        const approve = { x: deckX + aw - 40, y: deckY + ah - 38, s: 1 };
        moveHand(approve, t, reviewMs(300));
        t += reviewMs(300);
        moveHand({ ...approve, s: 0.86 }, t, reviewMs(80), "ease-out");
        at(press, [
          { transform: `translate(${approve.x}px, ${approve.y}px) scale(0.3)`, opacity: 0.9 },
          { transform: `translate(${approve.x}px, ${approve.y}px) scale(1.5)`, opacity: 0 },
        ], t, reviewMs(400), "ease-out", "none");
        at(card.querySelector(".act-yes"), [{
          backgroundColor: "#16a34a",
          borderColor: "#16a34a",
          color: "#fff",
          transform: "scale(1.12)",
        }], t, reviewMs(140), "ease-out");
        t += reviewMs(130);
        at(card, [
          { transform: tf(deckX, deckY) },
          { transform: tf(deckX + W / 2 + aw + 80, deckY + 80 * k, 28) },
        ], t, reviewTiming.throw, THROW);
        contextSwitches.push({ at: t + reviewTiming.overlap, index: i + 1 });
        t += reviewTiming.overlap;
        return;
      }

      moveHand(grab, t, reviewTiming.cursor);
      t += reviewTiming.cursor;
      moveHand({ ...grab, s: 0.86 }, t, reviewTiming.press, "ease-out");
      at(press, [
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(0.3)`, opacity: 0.9 },
        { transform: `translate(${grab.x}px, ${grab.y}px) scale(1.5)`, opacity: 0 },
      ], t, reviewMs(450), "ease-out", "none");
      t += reviewTiming.press;
      const dx = dir * reach;
      const dy = 10 * k;
      const drag = reviewTiming.drag;
      at(card, [{ transform: tf(deckX, deckY) }, { transform: tf(deckX + dx, deckY + dy, dir * 9) }], t, drag, DRAG);
      moveHand({ x: grab.x + dx, y: grab.y + dy, s: 0.86 }, t, drag, DRAG);
      at(card.querySelector(dir > 0 ? ".act-yes" : ".act-no"), [{
        backgroundColor: dir > 0 ? "#16a34a" : "#dc2626",
        borderColor: dir > 0 ? "#16a34a" : "#dc2626",
        color: "#fff",
        transform: "scale(1.12)",
      }], t + drag * 0.45, reviewMs(140), "ease-out");
      t += drag;
      moveHand({ ...hand, s: 1 }, t, reviewMs(100), "ease-out");
      const throwDuration = reviewTiming.throw;
      at(card, [
        { transform: tf(deckX + dx, deckY + dy, dir * 9) },
        { transform: tf(deckX + dir * (W / 2 + aw + 80), deckY + dy + 80 * k, dir * 28) },
      ], t, throwDuration, THROW);
      const switchAt = t + reviewTiming.overlap;
      contextSwitches.push({ at: switchAt, index: i + 1 });
      t += reviewTiming.overlap;
    });

    // Measure guided targets before creating the pane's entrance animation,
    // so getBoundingClientRect() reflects its final resting transform. The
    // animation keeps its original timeline even though it is created later.
    at(calendarPane, [{ opacity: 0, transform: W <= 900 ? "translate(-50%, 8px)" : "translateY(calc(-50% + 8px))" }, { opacity: 1, transform: W <= 900 ? "translate(-50%, 0)" : "translateY(-50%)" }], calendarEntranceAt, 320, DROP, "both");

    // 5. After four examples, the cursor leaves and the remaining cards are
    // handed to the viewer. The timeline stops here until they decide.
    at(cursor, [{ opacity: 1 }, { opacity: 0 }], t, reviewMs(220), "ease-in");
    interactiveAt = t + reviewMs(220);
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
  let wheelOffset = 0;
  let wheelTimer = 0;
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
    wheelOffset = 0;
    window.clearTimeout(wheelTimer);
    const card = acts[next];
    card.classList.add("is-interactive");
    card.style.pointerEvents = "auto";
    card.style.opacity = "1";
    card.style.transform = tf(interactiveLayout.deckX, interactiveLayout.deckY);
    card.title = "Drag left to decline or right to approve";
    clearButtonState(card);
    setCardEditing(card, false);
    if (next === SLOW) {
      const interactiveHint = card.animate([
        { transform: tf(interactiveLayout.deckX, interactiveLayout.deckY) },
        { transform: tf(interactiveLayout.deckX, interactiveLayout.deckY - 12) },
        { transform: tf(interactiveLayout.deckX, interactiveLayout.deckY) },
      ], {
        delay: 180,
        duration: 620,
        easing: "cubic-bezier(0.2, 0.8, 0.25, 1)",
      });
      manualAnims.push(interactiveHint);
    }
    setState("interactive");
    renderContext(next);
  };

  const completeChoice = (index, direction, draggedX = 0) => {
    if (interactionLocked || index !== interactiveIndex || !interactiveLayout || acts[index].classList.contains("is-editing")) return;
    interactionLocked = true;
    drag = null;
    wheelOffset = 0;
    window.clearTimeout(wheelTimer);
    const card = acts[index];
    snapAnims.get(card)?.cancel();
    const { W, aw, deckX, deckY, reach, k } = interactiveLayout;
    const startX = draggedX || direction * reach;
    card.classList.remove("is-interactive");
    card.style.pointerEvents = "none";
    card.removeAttribute("title");
    setCardEditing(card, false);
    editSnapshots.delete(index);
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
      setCardEditing(card, false);
      clearButtonState(card);
    }
    activateInteractiveCard();
  };

  acts.forEach((card, index) => {
    card.addEventListener("pointerdown", (event) => {
      if (index !== interactiveIndex || interactionLocked || card.classList.contains("is-editing") || event.target.closest(".act-control")) return;
      event.preventDefault();
      window.clearTimeout(wheelTimer);
      wheelOffset = 0;
      snapAnims.get(card)?.cancel();
      card.setPointerCapture(event.pointerId);
      drag = { pointerId: event.pointerId, startX: event.clientX, x: 0 };
      card.classList.add("is-dragging");
    });
    card.addEventListener("wheel", (event) => {
      if (index !== interactiveIndex || interactionLocked || card.classList.contains("is-editing") || event.target.closest(".act-control") || !interactiveLayout) return;
      const horizontal = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (!horizontal) return;
      event.preventDefault();
      snapAnims.get(card)?.cancel();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1;
      const limit = interactiveLayout.W * 0.62;
      // Trackpad scroll direction follows content, so invert it to make the
      // card follow the finger: scroll left to decline, right to approve.
      const visualScale = stage.getBoundingClientRect().width / stage.clientWidth;
      wheelOffset = Math.max(-limit, Math.min(limit, wheelOffset - (horizontal * unit) / visualScale));
      const rotation = (wheelOffset / interactiveLayout.reach) * 9;
      card.style.transform = tf(interactiveLayout.deckX + wheelOffset, interactiveLayout.deckY + 10 * interactiveLayout.k, rotation);
      const threshold = Math.min(96, interactiveLayout.aw * 0.3);
      showDecision(card, wheelOffset, Math.abs(wheelOffset) >= threshold * 0.55);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        if (index !== interactiveIndex || interactionLocked || !interactiveLayout) return;
        const releasedX = wheelOffset;
        wheelOffset = 0;
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
      }, 140);
    }, { passive: false });
    card.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId || index !== interactiveIndex || card.classList.contains("is-editing") || !interactiveLayout) return;
      const limit = interactiveLayout.W * 0.62;
      const visualScale = stage.getBoundingClientRect().width / stage.clientWidth;
      drag.x = Math.max(-limit, Math.min(limit, (event.clientX - drag.startX) / visualScale));
      const rotation = (drag.x / interactiveLayout.reach) * 9;
      card.style.transform = tf(interactiveLayout.deckX + drag.x, interactiveLayout.deckY + 10 * interactiveLayout.k, rotation);
      const threshold = Math.min(96, interactiveLayout.aw * 0.3);
      showDecision(card, drag.x, Math.abs(drag.x) >= threshold * 0.55);
    });
    const endDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId || index !== interactiveIndex || card.classList.contains("is-editing") || !interactiveLayout) return;
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
