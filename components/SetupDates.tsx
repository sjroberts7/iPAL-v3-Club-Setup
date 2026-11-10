"use client";
import { useState } from "react";
import type { Club } from "@/types";
import { useClub } from "@/lib/store";
import {
  locations,
  children,
  memberships,
  bookingTypes,
  demoClubs,
  weekNames,
} from "@/lib/demo-data";
import { availableWeekdays, dateLabel, day } from "@/lib/model";
import {
  Field,
  Select,
  Toggle,
  Heading,
  RadioOption,
  CheckOption,
  Button,
  Icon,
  Modal,
} from "./ui";
import { CalendarGrid } from "./ui/Calendar";
export function PeoplePicker({
  selected,
  onChange,
  label = "Select attendees",
}: {
  selected: string[];
  onChange: (s: string[]) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  return (
    <div className="stack tight">
      <Button variant="outline" onClick={() => setOpen(!open)}>
        {label} <Icon name="chevron-down" />
      </Button>
      {open && (
        <div className="people-menu">
          <input
            aria-label="Search children"
            placeholder="Search name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {children
            .filter((n) => n.toLowerCase().includes(query.toLowerCase()))
            .map((n) => (
              <CheckOption
                key={n}
                label={n}
                checked={selected.includes(n)}
                onChange={() =>
                  onChange(
                    selected.includes(n)
                      ? selected.filter((x) => x !== n)
                      : [...selected, n],
                  )
                }
              />
            ))}
        </div>
      )}
      <div className="chips">
        {selected.map((n) => (
          <button
            type="button"
            key={n}
            className="chip"
            onClick={() => onChange(selected.filter((x) => x !== n))}
          >
            {n}
            <Icon name="x" />
          </button>
        ))}
      </div>
    </div>
  );
}
export function Setup() {
  const { state, update } = useClub();
  const c = state.draft;
  const [choosing, setChoosing] = useState(!c.bookingType);
  const patch = (p: Partial<typeof c>) => update((c) => ({ ...c, ...p }));
  return (
    <div className={`setup content ${choosing ? "booking-types" : ""}`}>
      <Heading small title="Select your Booking Type" />
      {choosing ? (
        <div className="stack">
          {bookingTypes.map(([name, desc, icon]) => (
            <RadioOption
              key={name}
              label={name}
              description={desc}
              icon={icon}
              checked={c.bookingType === name}
              onChange={() => {
                patch({ bookingType: name });
                setChoosing(false);
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <RadioOption
            label={c.bookingType}
            description={bookingTypes.find((t) => t[0] === c.bookingType)?.[1]}
            icon={bookingTypes.find((t) => t[0] === c.bookingType)?.[2]}
            checked
            onChange={() => setChoosing(true)}
          />
          <section className="stack">
            <Heading small title="Details" />
            <Field
              label="Club Name"
              value={c.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <Field label="Description">
              <textarea
                aria-label="Description"
                value={c.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>
            <Select
              label="Location"
              placeholder="Select location"
              value={c.location}
              onChange={(location) => patch({ location })}
              options={locations}
            />
            <div className="short-input">
              <Field
                label="Minimum Booking Amount"
                optional
                type="number"
                min="0"
                value={c.minimum}
                onChange={(e) => patch({ minimum: e.target.value })}
              />
            </div>
          </section>
          <section className="stack">
            <Heading small title="Options" />
            <Toggle
              label="Allow Cancellations"
              checked={c.cancellations}
              onChange={(cancellations) => patch({ cancellations })}
            />
            {c.cancellations && (
              <div className="short-input">
                <Field
                  label="Cancellation Period"
                  type="number"
                  min="0"
                  value={c.cancellationPeriod}
                  onChange={(e) =>
                    patch({ cancellationPeriod: e.target.value })
                  }
                />
              </div>
            )}
            <Toggle
              label="Enable Waiting List"
              checked={c.waiting}
              onChange={(waiting) => patch({ waiting })}
            />
            {c.waiting && (
              <div className="indent">
                <Toggle
                  label="Auto Invite"
                  checked={c.autoInvite}
                  onChange={(autoInvite) => patch({ autoInvite })}
                />
              </div>
            )}
            <Toggle
              label="Trials"
              checked={c.trials}
              onChange={(trials) => patch({ trials })}
            />
            <Toggle
              label="Free Club"
              checked={c.free}
              onChange={(free) => patch({ free })}
            />
          </section>
          <section className="stack">
            <Heading small title="Who’s Attending?" optional />
            {["Children Only", "Adults Only", "Both Adults & Children"].map(
              (v) => (
                <RadioOption
                  key={v}
                  label={v}
                  checked={c.attending === v}
                  onChange={() => patch({ attending: v })}
                />
              ),
            )}
            <Toggle
              label="Members Only"
              checked={c.membersOnly}
              onChange={(membersOnly) => patch({ membersOnly })}
            />
            {c.membersOnly && (
              <Select
                label="Select Membership"
                value={c.membership}
                onChange={(membership) => patch({ membership })}
                options={memberships}
              />
            )}
            <Toggle
              label="Private"
              description="Make this club exclusive to certain attendees"
              checked={c.private}
              onChange={(v) => patch({ private: v })}
            />
            {c.private && (
              <PeoplePicker
                selected={c.attendees}
                onChange={(attendees) => patch({ attendees })}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
export function CopyClubModal({
  kind,
  onClose,
  onCopy,
}: {
  kind: "dates" | "fees";
  onClose: () => void;
  onCopy: (c: Club) => void;
}) {
  const { state } = useClub();
  const clubs = [
    ...state.clubs,
    ...demoClubs().filter((c) => !state.clubs.some((x) => x.id === c.id)),
  ];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const picked = clubs.find((c) => c.id === selected);
  return (
    <Modal
      width={805}
      title={
        kind === "dates" ? "Copy dates from club" : "Copy late fees from club"
      }
      onClose={onClose}
      className="copy-modal"
    >
      <div className="copy-grid">
        <div className="stack">
          <input
            aria-label="Search clubs to copy"
            placeholder="Search by name or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {clubs
            .filter((c) =>
              `${c.name} ${c.location}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((c) => (
              <RadioOption
                key={c.id}
                label={c.name}
                description={`${c.dates.length} Dates`}
                checked={c.id === selected}
                onChange={() => setSelected(c.id)}
              />
            ))}
        </div>
        {picked && (
          <div className="copy-preview">
            <header>
              <small>Copying From</small>
              <strong>{picked.name}</strong>
            </header>
            <div className="stack pad">
              {kind === "dates" ? (
                <>
                  <small>{picked.dates.length} Dates to copy</small>
                  {picked.dates.map((d) => (
                    <div className="preview-line" key={d}>
                      • {dateLabel(d)}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <small>
                    {picked.sessions[0]?.fees.length || 0} stages to copy
                  </small>
                  {picked.sessions[0]?.fees.map((f, i) => (
                    <div key={f.id} className="preview-line">
                      {i + 1}. {f.delay} after session start = £{f.amount}
                    </div>
                  ))}
                </>
              )}
              <Button variant="success" onClick={() => onCopy(picked)}>
                {kind === "dates" ? "Copy these Dates" : "Copy these stages"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
export function Dates() {
  const { state, update } = useClub();
  const c = state.draft;
  const [copy, setCopy] = useState(false);
  return (
    <div className="dates content">
      <Heading
        title="Select your club dates"
        description="Choose when your club will run. You can always edit these later."
      />
      <div className="dates-layout">
        <aside className="stack">
          <div className="card stack tight">
            <span className="muted">Selected</span>
            <h3>{c.dates.length} dates</h3>
          </div>
          <div className="card stack">
            <span>Selectable days of the week</span>
            <div className="weekday-buttons">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <button
                  type="button"
                  key={d}
                  aria-label={weekNames[d]}
                  aria-pressed={c.weekdays.includes(d)}
                  className={`circle ${c.weekdays.includes(d) ? "selected" : ""}`}
                  onClick={() =>
                    update((c) => {
                      const weekdays = c.weekdays.includes(d)
                        ? c.weekdays.filter((x) => x !== d)
                        : [...c.weekdays, d];
                      return {
                        ...c,
                        weekdays,
                        dates: c.dates.filter((x) => weekdays.includes(day(x))),
                        groupSignature: "",
                      };
                    })
                  }
                >
                  {weekNames[d][0]}
                </button>
              ))}
            </div>
            <small>Only highlighted days are selectable on the calendar</small>
          </div>
          <button
            type="button"
            className="card copy-action"
            onClick={() => setCopy(true)}
          >
            <span className="feature-icon">
              <Icon name="copy" />
            </span>
            <span>
              Copy dates from club<small>Reuse an existing schedule</small>
            </span>
          </button>
        </aside>
        <CalendarGrid
          selected={c.dates}
          weekdays={c.weekdays}
          onSelect={(d) =>
            update((c) => ({
              ...c,
              dates: c.dates.includes(d)
                ? c.dates.filter((x) => x !== d)
                : [...c.dates, d],
              groupSignature: "",
            }))
          }
        />
      </div>
      {copy && (
        <CopyClubModal
          kind="dates"
          onClose={() => setCopy(false)}
          onCopy={(source) => {
            update((c) => ({
              ...c,
              dates: [...source.dates],
              weekdays: availableWeekdays(source.dates),
              groupSignature: "",
            }));
            setCopy(false);
          }}
        />
      )}
    </div>
  );
}
