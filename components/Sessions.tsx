"use client";
import { useState } from "react";
import type { Session, Extra, Pricing, Club, Availability } from "@/types";
import { useClub } from "@/lib/store";
import {
  newSession,
  newExtra,
  uid,
  sessionErrors,
  priceErrors,
  availableDates,
  availableWeekdays,
  timeLabel,
  autoGroups,
  overlapPairs,
} from "@/lib/model";
import { demoSessions, demoExtras, weekNames } from "@/lib/demo-data";
import {
  Button,
  IconButton,
  Icon,
  Modal,
  Confirm,
  Field,
  Select,
  Toggle,
  Money,
  Heading,
  Optional,
  RadioOption,
  CheckOption,
  Errors,
} from "./ui";
import { CalendarGrid } from "./ui/Calendar";
export function PricingFields({
  value,
  onChange,
  membership,
  inline = false,
  free = false,
}: {
  value: Pricing;
  onChange: (p: Pricing) => void;
  membership: boolean;
  inline?: boolean;
  free?: boolean;
}) {
  const extras = [
    ["weekly", "Weekly Price", "Discounted rate for full weeks booked"],
    [
      "monthly",
      "Monthly Price",
      "Applies when all sessions in the month are attended. If any sessions are missed, the per-session price applies.",
    ],
    [
      "within",
      "Price Within Days",
      "The price applied during the final days before the club begins.",
    ],
    ["members", "Members Price", "Price applied for members only"],
  ] as const;
  return (
    <div className={inline ? "pricing-inline" : "stack"}>
      <Select
        label="Pricing type"
        value={value.type}
        options={["Per Session", "As a Whole"]}
        onChange={(v) => onChange({ ...value, type: v as Pricing["type"] })}
      />
      <Money
        label="Standard Price"
        value={free ? "0" : value.standard}
        onChange={(v) => onChange({ ...value, standard: v })}
      />
      {extras
        .filter(([key]) => key !== "members" || membership)
        .map(([key, label, description]) =>
          inline ? (
            value[key].enabled && (
              <Money
                key={key}
                label={label}
                value={value[key].value}
                onChange={(v) =>
                  onChange({ ...value, [key]: { ...value[key], value: v } })
                }
              />
            )
          ) : (
            <div className="stack tight" key={key}>
              <Toggle
                label={label}
                description={description}
                checked={value[key].enabled}
                onChange={(enabled) =>
                  onChange({ ...value, [key]: { ...value[key], enabled } })
                }
              />
              {value[key].enabled && (
                <div className="indent stack tight">
                  <Money
                    label={`${label} amount`}
                    value={value[key].value}
                    onChange={(v) =>
                      onChange({ ...value, [key]: { ...value[key], value: v } })
                    }
                  />
                  {key === "within" && (
                    <Field
                      label="Days before club begins"
                      type="number"
                      min="1"
                      value={value.within.days}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          within: { ...value.within, days: e.target.value },
                        })
                      }
                    />
                  )}
                </div>
              )}
            </div>
          ),
        )}
    </div>
  );
}
export function ItemEditor({
  item,
  extra,
  onSave,
  onClose,
  reusing = false,
}: {
  item: Session | Extra;
  extra: boolean;
  onSave: (s: Session | Extra) => void;
  onClose: () => void;
  reusing?: boolean;
}) {
  const { state } = useClub();
  const [draft, setDraft] = useState(item);
  const [errors, setErrors] = useState<string[]>([]);
  const existing = !!item.name;
  const save = () => {
    const e = extra
      ? [
          ...(!draft.name.trim() ? ["Enter a name."] : []),
          ...(!state.draft.free
            ? priceErrors(draft.pricing, state.membershipEnabled)
            : []),
        ]
      : sessionErrors(
          draft as Session,
          state.membershipEnabled,
          state.draft.free,
        );
    setErrors(e);
    if (!e.length) onSave(draft);
  };
  return (
    <Modal
      title={
        reusing
          ? extra
            ? "Choose extra"
            : "Choose existing session"
          : existing
            ? extra
              ? "Edit extra"
              : "Edit Session"
            : extra
              ? "Create new extra"
              : "Create Session"
      }
      onClose={onClose}
      className="item-modal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={existing && !reusing ? "success" : "primary"}
            onClick={save}
          >
            {reusing
              ? extra
                ? "Add Extra"
                : "Add Session"
              : existing
                ? "Save changes"
                : extra
                  ? "Create Extra"
                  : "Create Session"}
          </Button>
        </>
      }
    >
      <Errors errors={errors} />
      <div className="stack">
        <Field
          label={extra ? "Name" : "Session Name"}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        {!extra && (
          <div className="grid2">
            <Field
              label="Start Time"
              type="time"
              value={(draft as Session).start}
              onChange={(e) =>
                setDraft({ ...draft, start: e.target.value } as Session)
              }
            />
            <Field
              label="End Time"
              type="time"
              value={(draft as Session).end}
              onChange={(e) =>
                setDraft({ ...draft, end: e.target.value } as Session)
              }
            />
          </div>
        )}
        <PricingFields
          value={draft.pricing}
          onChange={(pricing) => setDraft({ ...draft, pricing })}
          membership={state.membershipEnabled}
          free={state.draft.free}
        />
      </div>
    </Modal>
  );
}
function ExistingPicker({
  extra,
  onClose,
  onChoose,
}: {
  extra: boolean;
  onClose: () => void;
  onChoose: (item: Session | Extra) => void;
}) {
  const { state } = useClub();
  const [query, setQuery] = useState("");
  const source = extra
    ? [...demoExtras(), ...state.clubs.flatMap((c) => c.extras)]
    : [...demoSessions(), ...state.clubs.flatMap((c) => c.sessions)];
  return (
    <Modal
      title={extra ? "Choose extra" : "Choose existing session"}
      onClose={onClose}
    >
      <div className="stack">
        <Field
          label="Search"
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {source
          .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
          .map((s, i) => (
            <RadioOption
              key={`${s.id}-${i}`}
              label={s.name}
              description={
                extra
                  ? undefined
                  : `${timeLabel((s as Session).start)} – ${timeLabel((s as Session).end)}`
              }
              checked={false}
              onChange={() => onChoose({ ...structuredClone(s), id: uid() })}
            />
          ))}
      </div>
    </Modal>
  );
}
function AvailabilityModal({
  session,
  onSave,
  onClose,
}: {
  session: Session;
  onSave: (a: Availability) => void;
  onClose: () => void;
}) {
  const { state } = useClub();
  const c = state.draft;
  const [a, setA] = useState(session.availability);
  const [error, setError] = useState<string[]>([]);
  return (
    <Modal
      title="Session Availability"
      description={session.name}
      onClose={onClose}
      width={a.mode === "dates" ? 1034 : 529}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (
                !availableDates({ ...session, availability: a }, c.dates).length
              )
                setError(["Select at least one available date."]);
              else onSave(a);
            }}
          >
            Continue
          </Button>
        </>
      }
    >
      <Errors errors={error} />
      <div className="stack">
        <RadioOption
          label="All Available Dates"
          description="Show on every date this club runs"
          checked={a.mode === "all"}
          onChange={() => setA({ ...a, mode: "all" })}
        />
        <RadioOption
          label="Specific days of the week"
          description="e.g. only on Mondays and Wednesdays"
          checked={a.mode === "weekdays"}
          onChange={() => setA({ ...a, mode: "weekdays" })}
        />
        {a.mode === "weekdays" && (
          <div className="choices">
            {availableWeekdays(c.dates).map((d) => (
              <CheckOption
                key={d}
                card
                label={weekNames[d]}
                checked={a.weekdays.includes(d)}
                onChange={() =>
                  setA({
                    ...a,
                    weekdays: a.weekdays.includes(d)
                      ? a.weekdays.filter((x) => x !== d)
                      : [...a.weekdays, d],
                  })
                }
              />
            ))}
          </div>
        )}
        <RadioOption
          label="Specific dates only"
          description="Choose exact dates from the configured calendar"
          checked={a.mode === "dates"}
          onChange={() => setA({ ...a, mode: "dates" })}
        />
        {a.mode === "dates" && (
          <CalendarGrid
            compact
            allowed={c.dates}
            selected={a.dates}
            onSelect={(d) =>
              setA({
                ...a,
                dates: a.dates.includes(d)
                  ? a.dates.filter((x) => x !== d)
                  : [...a.dates, d],
              })
            }
          />
        )}
      </div>
    </Modal>
  );
}
export function GroupModal({
  club,
  onClose,
  onSave,
}: {
  club: Club;
  onClose: () => void;
  onSave: (groups: Record<string, string>) => void;
}) {
  const [auto, setAuto] = useState(true);
  const [groups, setGroups] = useState(autoGroups(club));
  const involved = new Set(overlapPairs(club).flat());
  const relevant = club.sessions.filter((s) => involved.has(s.id));
  const labels = Array.from({ length: Math.max(2, relevant.length) }, (_, i) =>
    String.fromCharCode(65 + i),
  );
  return (
    <Modal
      title="Group time slots"
      description="Group overlapping time slots to manage your capacity"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Go back
          </Button>
          <Button onClick={() => onSave(groups)}>Continue</Button>
        </>
      }
    >
      <div className="stack">
        <CheckOption
          label="Auto group sessions that overlap"
          checked={auto}
          onChange={() => {
            setAuto(!auto);
            if (!auto) setGroups(autoGroups(club));
          }}
        />
        {relevant.map((s) => (
          <div className="group-row" key={s.id}>
            <span className="group-badge">{groups[s.id]}</span>
            <div className="grow">
              {s.name}
              <small>
                {timeLabel(s.start)} – {timeLabel(s.end)}
              </small>
            </div>
            <div className="row wrap">
              {labels.map((g) => (
                <button
                  type="button"
                  aria-label={`${s.name} group ${g}`}
                  aria-pressed={groups[s.id] === g}
                  className={`circle ${groups[s.id] === g ? "selected" : ""}`}
                  key={g}
                  onClick={() => {
                    setAuto(false);
                    setGroups({ ...groups, [s.id]: g });
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
export function Sessions() {
  const { state, update } = useClub();
  const c = state.draft;
  const [editor, setEditor] = useState<{
    item: Session | Extra;
    extra: boolean;
    reuse?: boolean;
  } | null>(null);
  const [picker, setPicker] = useState<"session" | "extra" | null>(null);
  const [availability, setAvailability] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState<{
    id: string;
    name: string;
    extra: boolean;
  } | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const patch = (id: string, p: Partial<Session>, extra = false) =>
    update((c) =>
      extra
        ? {
            ...c,
            extras: c.extras.map((s) => (s.id === id ? { ...s, ...p } : s)),
          }
        : {
            ...c,
            sessions: c.sessions.map((s) => (s.id === id ? { ...s, ...p } : s)),
          },
    );
  const reorder = (from: string, to: string) =>
    update((c) => {
      const sessions = [...c.sessions];
      const a = sessions.findIndex((s) => s.id === from),
        b = sessions.findIndex((s) => s.id === to);
      if (a < 0 || b < 0) return c;
      sessions.splice(b, 0, sessions.splice(a, 1)[0]);
      return { ...c, sessions };
    });
  return (
    <div
      className={`sessions content ${!c.sessions.length ? "empty-sessions" : ""}`}
    >
      <Heading
        title="Create your sessions"
        description="Add the sessions that parents will be able to book."
      />
      <div className="row actions">
        <Button onClick={() => setEditor({ item: newSession(), extra: false })}>
          Create Session
        </Button>
        <Button variant="outline" onClick={() => setPicker("session")}>
          Use existing session
        </Button>
      </div>
      {c.sessions.map((s, index) => (
        <div
          className={`session-card ${drag === s.id ? "is-dragging" : ""}`}
          data-session-id={s.id}
          key={s.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (drag) reorder(drag, s.id);
            setDrag(null);
          }}
        >
          <div className="session-top">
            <button
              className="drag-handle"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag(s.id);
              }}
              onPointerUp={(e) => {
                const target = document
                  .elementFromPoint(e.clientX, e.clientY)
                  ?.closest<HTMLElement>("[data-session-id]")
                  ?.dataset.sessionId;
                if (drag && target && drag !== target) reorder(drag, target);
                setDrag(null);
                if (e.currentTarget.hasPointerCapture(e.pointerId))
                  e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && index > 0) {
                  e.preventDefault();
                  reorder(s.id, c.sessions[index - 1].id);
                }
                if (e.key === "ArrowDown" && index < c.sessions.length - 1) {
                  e.preventDefault();
                  reorder(s.id, c.sessions[index + 1].id);
                }
              }}
              title="Drag to reorder; use arrow keys when focused"
              aria-label={`Reorder ${s.name}`}
            >
              <Icon name="grip" />
            </button>
            <div className="grow">
              <strong>{s.name}</strong>
              <small>
                {timeLabel(s.start)} – {timeLabel(s.end)}
              </small>
            </div>
            <Button
              variant="outline"
              icon="calendar"
              onClick={() => setAvailability(s)}
            >
              {s.availability.mode === "all"
                ? "All Dates"
                : s.availability.mode === "weekdays"
                  ? s.availability.weekdays
                      .map((d) => weekNames[d].slice(0, 3))
                      .join(", ")
                  : `${availableDates(s, c.dates).length} dates`}
            </Button>
            <IconButton
              name="edit"
              label={`Edit ${s.name}`}
              onClick={() => setEditor({ item: s, extra: false })}
            />
            <IconButton
              name="trash"
              label={`Delete ${s.name}`}
              onClick={() =>
                setDeleting({ id: s.id, name: s.name, extra: false })
              }
            />
            <Toggle
              label={`${s.name} live`}
              checked={s.live}
              onChange={(live) => patch(s.id, { live })}
            />
          </div>
          <PricingFields
            inline
            value={s.pricing}
            onChange={(pricing) => patch(s.id, { pricing })}
            membership={state.membershipEnabled}
            free={c.free}
          />
        </div>
      ))}
      {!!c.sessions.length && (
        <>
          <div className="row extra-heading">
            <h3>Add Extras</h3>
            <Optional />
            <Icon name="info" />
          </div>
          <div className="row actions">
            <Button
              onClick={() => setEditor({ item: newExtra(), extra: true })}
            >
              Create extra
            </Button>
            <Button variant="outline" onClick={() => setPicker("extra")}>
              Use existing extra
            </Button>
          </div>
          {c.extras.map((x) => (
            <div className="session-card" key={x.id}>
              <div className="session-top">
                <strong className="grow">{x.name}</strong>
                <IconButton
                  name="edit"
                  label={`Edit ${x.name}`}
                  onClick={() => setEditor({ item: x, extra: true })}
                />
                <IconButton
                  name="trash"
                  label={`Delete ${x.name}`}
                  onClick={() =>
                    setDeleting({ id: x.id, name: x.name, extra: true })
                  }
                />
                <Toggle
                  label={`${x.name} live`}
                  checked={x.live}
                  onChange={(live) => patch(x.id, { live }, true)}
                />
              </div>
              <PricingFields
                inline
                value={x.pricing}
                onChange={(pricing) => patch(x.id, { pricing }, true)}
                membership={state.membershipEnabled}
                free={c.free}
              />
            </div>
          ))}
        </>
      )}
      {editor && (
        <ItemEditor
          item={editor.item}
          extra={editor.extra}
          reusing={editor.reuse}
          onClose={() => setEditor(null)}
          onSave={(item) => {
            update((c) => {
              if (editor.extra) {
                const extras = c.extras.some((s) => s.id === item.id)
                  ? c.extras.map((s) =>
                      s.id === item.id ? (item as Extra) : s,
                    )
                  : [...c.extras, item as Extra];
                return { ...c, extras };
              }
              const sessions = c.sessions.some((s) => s.id === item.id)
                ? c.sessions.map((s) =>
                    s.id === item.id ? (item as Session) : s,
                  )
                : [...c.sessions, item as Session];
              return { ...c, sessions };
            });
            setEditor(null);
          }}
        />
      )}
      {picker && (
        <ExistingPicker
          extra={picker === "extra"}
          onClose={() => setPicker(null)}
          onChoose={(item) => {
            setEditor({ item, extra: picker === "extra", reuse: true });
            setPicker(null);
          }}
        />
      )}
      {availability && (
        <AvailabilityModal
          session={availability}
          onClose={() => setAvailability(null)}
          onSave={(a) => {
            patch(availability.id, { availability: a });
            setAvailability(null);
          }}
        />
      )}
      {deleting && (
        <Confirm
          title={`Delete ${deleting.extra ? "extra" : "session"}`}
          description={`Delete ${deleting.name}${deleting.extra ? "" : " and its capacity and late-fee settings"}?`}
          danger
          label="Delete"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            update((c) =>
              deleting.extra
                ? { ...c, extras: c.extras.filter((s) => s.id !== deleting.id) }
                : {
                    ...c,
                    sessions: c.sessions.filter((s) => s.id !== deleting.id),
                  },
            );
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
