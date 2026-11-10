import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newClub,
  newSession,
  newState,
  availableDates,
  availableWeekdays,
  overlapPairs,
  autoGroups,
  reconcile,
  validateStep,
  validateClub,
  loadState,
  groupingSignature,
  feeTrigger,
} from "../lib/model";
function club() {
  const c = newClub();
  c.name = "Out of School Club";
  c.location = "Greystoke Primary School";
  c.bookingType = "Individual Booking";
  c.dates = ["2026-11-09", "2026-11-10", "2026-11-11"];
  const s = newSession();
  s.name = "Before School";
  s.start = "07:30";
  s.end = "09:00";
  s.pricing.standard = "5.00";
  c.sessions = [s];
  return c;
}
test("all-date, weekday and individual-date availability are bounded by club dates", () => {
  const c = club(),
    s = c.sessions[0];
  assert.deepEqual(availableDates(s, c.dates), c.dates);
  s.availability = { mode: "weekdays", weekdays: [1], dates: [] };
  assert.deepEqual(availableDates(s, c.dates), ["2026-11-09"]);
  s.availability = {
    mode: "dates",
    weekdays: [],
    dates: ["2026-11-10", "2030-01-01"],
  };
  assert.deepEqual(availableDates(s, c.dates), ["2026-11-10"]);
  assert.deepEqual(availableWeekdays(c.dates), [1, 2, 3]);
});
test("overlap detection requires shared dates and intersecting actual times", () => {
  const c = club(),
    a = c.sessions[0],
    b = {
      ...newSession(),
      name: "Early Drop Off",
      start: "08:00",
      end: "09:30",
    };
  c.sessions.push(b);
  assert.deepEqual(overlapPairs(c), [[a.id, b.id]]);
  assert.equal(autoGroups(c)[a.id], autoGroups(c)[b.id]);
  b.start = "09:00";
  assert.deepEqual(overlapPairs(c), []);
  b.start = "08:00";
  a.availability = { mode: "weekdays", weekdays: [1], dates: [] };
  b.availability = { mode: "weekdays", weekdays: [2], dates: [] };
  assert.deepEqual(overlapPairs(c), []);
});
test("master date edits remove invalid availability and capacity overrides", () => {
  const c = club(),
    s = c.sessions[0];
  s.availability = {
    mode: "dates",
    weekdays: [],
    dates: ["2026-11-09", "2026-11-10"],
  };
  s.capacity.dates = { "2026-11-09": "15", "2026-11-10": "10" };
  s.capacity.weekdays = { "1": "15", "2": "10" };
  c.dates = ["2026-11-10"];
  const result = reconcile(c);
  assert.deepEqual(result.sessions[0].availability.dates, ["2026-11-10"]);
  assert.deepEqual(result.sessions[0].capacity.dates, { "2026-11-10": "10" });
  assert.deepEqual(result.sessions[0].capacity.weekdays, { "2": "10" });
});
test("capacity and fees remain associated by session ID after reordering and deletion", () => {
  const c = club();
  const s = c.sessions[0];
  s.capacity.all = "20";
  s.fees = [{ id: "fee", delay: "00:10", amount: "2" }];
  c.sessions.push(newSession());
  c.sessions.reverse();
  assert.equal(c.sessions.find((x) => x.id === s.id)?.capacity.all, "20");
  c.sessions = c.sessions.filter((x) => x.id !== s.id);
  assert.equal(c.sessions.flatMap((x) => x.fees).length, 0);
});
test("unlimited capacity preserves limits and bypasses only capacity validation", () => {
  const c = club();
  c.sessions[0].capacity.ages = [
    { id: "age", min: "8", max: "5", capacity: "2" },
  ];
  assert.ok(validateStep(c, 3).length);
  c.unlimited = true;
  assert.deepEqual(validateStep(c, 3), []);
  assert.equal(c.sessions[0].capacity.ages[0].min, "8");
  c.unlimited = false;
  assert.ok(validateStep(c, 3).length);
});
test("restriction allowlists and explicit child blocklist remain separate", () => {
  const c = club();
  c.restrictions.location = true;
  assert.ok(validateStep(c, 5).length);
  c.restrictions.locations = ["Greystoke Primary School"];
  c.restrictions.child = true;
  c.restrictions.children = ["Sam Roberts"];
  assert.deepEqual(validateStep(c, 5), []);
  assert.deepEqual(c.restrictions.children, ["Sam Roberts"]);
});
test("fees calculate triggers relative to start including day rollover", () => {
  assert.equal(feeTrigger("07:30", "00:10"), "07:40");
  assert.equal(feeTrigger("23:50", "00:20"), "00:10 (+1 day)");
});
test("discount limits, percentage and date range validation", () => {
  const c = club();
  c.discounts = [
    {
      id: "d",
      type: "promo",
      value: "10",
      code: "SUMMER26",
      threshold: "",
      siblings: "2+",
      perCustomer: "",
      total: "",
      start: "",
      end: "",
      expanded: true,
    },
  ];
  assert.deepEqual(validateStep(c, 7), []);
  c.discounts[0].value = "101";
  assert.ok(validateStep(c, 7).length);
  c.discounts[0].value = "10";
  c.discounts[0].start = "2026-12-01";
  c.discounts[0].end = "2026-11-01";
  assert.ok(validateStep(c, 7).length);
});
test("register addresses and passwords validate only when enabled", () => {
  const c = club();
  c.email.registers = true;
  c.email.addresses = "staff@example.com, leader@example.org";
  assert.deepEqual(validateStep(c, 8), []);
  c.email.password = "hello";
  assert.ok(validateStep(c, 8).length);
  c.email.confirm = "hello";
  assert.deepEqual(validateStep(c, 8), []);
  c.email.addresses = "invalid";
  assert.ok(validateStep(c, 8).length);
  c.email.registers = false;
  assert.deepEqual(validateStep(c, 8), []);
});
test("valid whole journey and persistence round-trip preserve settings and progress", () => {
  const c = club();
  assert.deepEqual(validateClub(c), []);
  const state = {
    ...newState(),
    draft: c,
    step: 7,
    view: "wizard" as const,
    completed: [0, 1, 2, 3, 4, 5, 6],
    clubs: [{ ...c, createdAt: "2026-11-10" }],
  };
  const loaded = loadState(JSON.stringify(state));
  assert.deepEqual(loaded, state);
  assert.equal(loadState("{bad").version, 1);
});
test("changing time or availability invalidates grouping signature", () => {
  const c = club(),
    before = groupingSignature(c);
  c.sessions[0].start = "07:45";
  assert.notEqual(groupingSignature(c), before);
});
test("member prices validate only while the feature is enabled; free club skips prices", () => {
  const c = club();
  c.sessions[0].pricing.members.enabled = true;
  assert.ok(validateStep(c, 2, true).length);
  assert.deepEqual(validateStep(c, 2, false), []);
  c.free = true;
  c.sessions[0].pricing.standard = "";
  assert.deepEqual(validateStep(c, 2, true), []);
});

test("pricing and order edits do not invalidate grouping", () => {
  const c = club();
  c.sessions.push({
    ...newSession(),
    name: "Other",
    start: "08:00",
    end: "09:30",
  });
  const before = groupingSignature(c);
  c.sessions.reverse();
  c.sessions[0].pricing.standard = "8";
  assert.equal(groupingSignature(c), before);
});
