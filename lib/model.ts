import type {
  AppState,
  Club,
  Pricing,
  Session,
  Capacity,
  Extra,
} from "@/types";
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const newPricing = (): Pricing => ({
  type: "Per Session",
  standard: "",
  weekly: { enabled: false, value: "" },
  monthly: { enabled: false, value: "" },
  within: { enabled: false, value: "", days: "" },
  members: { enabled: false, value: "" },
});
export const newCapacity = (): Capacity => ({
  all: "",
  custom: false,
  weekdays: {},
  dates: {},
  ages: [],
});
export const newSession = (): Session => ({
  id: uid(),
  name: "",
  start: "",
  end: "",
  live: true,
  pricing: newPricing(),
  availability: { mode: "all", weekdays: [], dates: [] },
  capacity: newCapacity(),
  fees: [],
  group: "A",
});
export const newExtra = (): Extra => ({
  id: uid(),
  name: "",
  live: true,
  pricing: newPricing(),
});
export const newClub = (): Club => ({
  id: uid(),
  name: "",
  description: "",
  bookingType: "",
  location: "",
  minimum: "0",
  cancellations: true,
  cancellationPeriod: "0",
  waiting: false,
  autoInvite: false,
  trials: false,
  free: false,
  attending: "Children Only",
  membersOnly: false,
  membership: "",
  private: false,
  attendees: [],
  tile: {
    name: "",
    image: "",
    live: "",
    offline: "",
    archive: "",
    shadow: false,
    background: "#3b82f6",
    color: "#ffffff",
  },
  dates: [],
  weekdays: [1, 2, 3, 4, 5],
  sessions: [],
  extras: [],
  unlimited: false,
  groupSignature: "",
  payments: {
    card: true,
    monthly: true,
    outstanding: true,
    taxFree: true,
    wallet: true,
    whenDue: true,
    partial: true,
    equal: true,
    category: "",
    account: "",
  },
  restrictions: {
    age: false,
    min: "",
    max: "",
    location: false,
    locations: [],
    year: false,
    years: [],
    class: false,
    classes: [],
    child: false,
    children: [],
  },
  discounts: [],
  email: {
    html: "",
    attachments: [],
    registers: false,
    addresses: "",
    time: "14:00",
    fields: [],
    password: "",
    confirm: "",
  },
});
export const newState = (): AppState => ({
  version: 1,
  view: "clubs",
  step: 0,
  completed: [],
  draft: newClub(),
  clubs: [],
  selectedId: null,
  membershipEnabled: true,
});
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseDate = (s: string) => new Date(`${s}T12:00:00`);
export const day = (s: string) => parseDate(s).getDay();
export const dateLabel = (s: string) =>
  s
    ? parseDate(s).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
export const money = (s: string | number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number(s) || 0,
  );
export const timeMinutes = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
export const timeLabel = (s: string) => {
  if (!s) return "—";
  const [h, m] = s.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};
export const feeTrigger = (start: string, delay: string) => {
  const mins = timeMinutes(start) + timeMinutes(delay || "00:00");
  return `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}${mins >= 1440 ? " (+1 day)" : ""}`;
};
export const availableDates = (s: Session, dates: string[]) =>
  dates.filter(
    (d) =>
      s.availability.mode === "all" ||
      (s.availability.mode === "dates"
        ? s.availability.dates.includes(d)
        : s.availability.weekdays.includes(day(d))),
  );
export const availableWeekdays = (dates: string[]) =>
  [1, 2, 3, 4, 5, 6, 0].filter((d) => dates.some((x) => day(x) === d));
export const overlapPairs = (c: Club) => {
  const out: [string, string][] = [];
  for (let i = 0; i < c.sessions.length; i++)
    for (let j = i + 1; j < c.sessions.length; j++) {
      const a = c.sessions[i],
        b = c.sessions[j];
      if (
        timeMinutes(a.start) < timeMinutes(b.end) &&
        timeMinutes(b.start) < timeMinutes(a.end) &&
        availableDates(a, c.dates).some((d) =>
          availableDates(b, c.dates).includes(d),
        )
      )
        out.push([a.id, b.id]);
    }
  return out;
};
export const groupingSignature = (c: Club) =>
  JSON.stringify(
    [...c.sessions]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((s) => [s.id, s.start, s.end, availableDates(s, c.dates)]),
  );
export const autoGroups = (c: Club) => {
  const pairs = overlapPairs(c);
  const groups: Record<string, string> = {};
  let index = 0;
  for (const s of c.sessions) {
    if (groups[s.id]) continue;
    const label = String.fromCharCode(65 + index++);
    const queue = [s.id];
    while (queue.length) {
      const id = queue.pop()!;
      if (groups[id]) continue;
      groups[id] = label;
      for (const [a, b] of pairs) {
        if (a === id && !groups[b]) queue.push(b);
        if (b === id && !groups[a]) queue.push(a);
      }
    }
  }
  return groups;
};
export function reconcile(c: Club): Club {
  const dates = [...new Set(c.dates)].sort();
  return {
    ...c,
    dates,
    sessions: c.sessions.map((s) => {
      const availability = {
        ...s.availability,
        dates: s.availability.dates.filter((d) => dates.includes(d)),
        weekdays: s.availability.weekdays.filter((d) =>
          availableWeekdays(dates).includes(d),
        ),
      };
      const valid = availableDates({ ...s, availability }, dates);
      return {
        ...s,
        availability,
        capacity: {
          ...s.capacity,
          dates: Object.fromEntries(
            Object.entries(s.capacity.dates).filter(([d]) => valid.includes(d)),
          ),
          weekdays: Object.fromEntries(
            Object.entries(s.capacity.weekdays).filter(([d]) =>
              availableWeekdays(valid).includes(Number(d)),
            ),
          ),
        },
      };
    }),
  };
}
const nonnegative = (s: string) =>
  s.trim() !== "" && Number.isFinite(Number(s)) && Number(s) >= 0;
const integer = (s: string) => nonnegative(s) && Number.isInteger(Number(s));
export function priceErrors(p: Pricing, membership = true): string[] {
  const out: string[] = [];
  if (!nonnegative(p.standard)) out.push("Enter a valid standard price.");
  for (const [k, v] of Object.entries(p)) {
    if (
      typeof v === "object" &&
      v.enabled &&
      (k !== "members" || membership) &&
      !nonnegative(v.value)
    )
      out.push(`Enter a valid ${k} price.`);
  }
  if (p.within.enabled && (!integer(p.within.days) || +p.within.days < 1))
    out.push("Enter the number of days before the club begins.");
  return out;
}
export function sessionErrors(
  s: Session,
  membership = true,
  free = false,
): string[] {
  const out = [];
  if (!s.name.trim()) out.push("Enter a session name.");
  if (!s.start || !s.end || timeMinutes(s.start) >= timeMinutes(s.end))
    out.push("End time must be after start time.");
  if (!free) out.push(...priceErrors(s.pricing, membership));
  return out;
}
export function validateStep(
  c: Club,
  step: number,
  membership = true,
): string[] {
  const e: string[] = [];
  if (step === 0) {
    if (!c.bookingType) e.push("Select a booking type.");
    if (!c.name.trim()) e.push("Enter the Club Name.");
    if (!c.location) e.push("Select a location.");
    if (!integer(c.minimum))
      e.push("Minimum booking amount must be a whole number of zero or more.");
    if (c.cancellations && !integer(c.cancellationPeriod))
      e.push("Cancellation period must be zero or more.");
    if (c.membersOnly && !c.membership) e.push("Select a membership.");
    if (c.private && !c.attendees.length)
      e.push("Select at least one attendee.");
  }
  if (step === 1 && !c.dates.length) e.push("Select at least one club date.");
  if (step === 2) {
    if (!c.sessions.length) e.push("Create at least one session.");
    for (const s of c.sessions) {
      e.push(
        ...sessionErrors(s, membership, c.free).map(
          (x) => `${s.name || "Session"}: ${x}`,
        ),
      );
      if (!availableDates(s, c.dates).length)
        e.push(`${s.name}: choose at least one available date.`);
    }
    for (const x of c.extras) {
      if (!x.name.trim()) e.push("Enter an extra name.");
      if (!c.free)
        e.push(
          ...priceErrors(x.pricing, membership).map((t) => `${x.name}: ${t}`),
        );
    }
  }
  if (step === 3 && !c.unlimited)
    for (const s of c.sessions) {
      const cap = s.capacity;
      for (const v of [
        cap.all,
        ...(cap.custom ? Object.values(cap.weekdays) : []),
        ...Object.values(cap.dates),
      ])
        if (v !== "" && !integer(v))
          e.push(
            `${s.name}: capacities must be whole numbers of zero or more.`,
          );
      for (const a of cap.ages) {
        if (!integer(a.min) || !integer(a.max) || +a.min > +a.max)
          e.push(`${s.name}: minimum age must not exceed maximum age.`);
        if (!integer(a.capacity))
          e.push(`${s.name}: enter an age-group capacity.`);
      }
    }
  if (step === 5) {
    const r = c.restrictions;
    if (r.age && (!integer(r.min) || !integer(r.max) || +r.min > +r.max))
      e.push("Enter a valid age range.");
    for (const [enabled, values, label] of [
      [r.location, r.locations, "location"],
      [r.year, r.years, "year group"],
      [r.class, r.classes, "class"],
    ] as const)
      if (enabled && !values.length)
        e.push(`Choose at least one allowed ${label}.`);
    if (r.child && !r.children.length)
      e.push("Choose at least one restricted child.");
  }
  if (step === 6)
    for (const s of c.sessions)
      for (const f of s.fees) {
        if (
          !/^\d{2}:\d{2}$/.test(f.delay) ||
          timeMinutes(f.delay) < 0 ||
          !nonnegative(f.amount)
        )
          e.push(`${s.name}: enter a valid delay and late fee.`);
      }
  if (step === 7)
    for (const d of c.discounts) {
      if (!nonnegative(d.value) || +d.value > 100 || +d.value <= 0)
        e.push("Discount value must be greater than 0 and no more than 100%.");
      if (d.type === "promo" && !d.code.trim()) e.push("Enter a promo code.");
      if (d.type === "amount" && !nonnegative(d.threshold))
        e.push("Enter a valid spend threshold.");
      if (d.start && d.end && d.start > d.end)
        e.push("Discount end date must be on or after its start date.");
      for (const x of [d.perCustomer, d.total])
        if (x !== "" && (!integer(x) || +x < 1))
          e.push(
            "Usage limits must be positive whole numbers, or blank for unlimited.",
          );
    }
  if (step === 8 && c.email.registers) {
    if (
      !c.email.addresses.trim() ||
      c.email.addresses
        .split(",")
        .some((x) => !/^\s*[^\s@,]+@[^\s@,]+\.[^\s@,]+\s*$/.test(x))
    )
      e.push("Enter valid email addresses separated by commas.");
    if (!c.email.time) e.push("Choose a send time.");
    if (c.email.password !== c.email.confirm)
      e.push("Register passwords must match.");
  }
  return [...new Set(e)];
}
export const validateClub = (c: Club, membership = true) =>
  Array.from({ length: 9 }, (_, i) => ({
    step: i,
    errors: validateStep(c, i, membership),
  })).filter((x) => x.errors.length);
export function loadState(raw: string | null): AppState {
  if (!raw) return newState();
  try {
    const s = JSON.parse(raw);
    if (s.version !== 1 || !s.draft || !Array.isArray(s.clubs))
      return newState();
    return { ...s, draft: reconcile(s.draft) };
  } catch {
    return newState();
  }
}
