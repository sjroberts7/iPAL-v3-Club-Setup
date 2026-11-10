"use client";
import { useState } from "react";
import { useClub } from "@/lib/store";
import {
  availableDates,
  availableWeekdays,
  dateLabel,
  timeLabel,
  uid,
} from "@/lib/model";
import { weekNames } from "@/lib/demo-data";
import type { Capacity as Cap } from "@/types";
import {
  Heading,
  Toggle,
  Field,
  Button,
  IconButton,
  Icon,
  Modal,
  Confirm,
  Errors,
} from "./ui";
import { CalendarGrid } from "./ui/Calendar";
export function Capacity() {
  const { state, update } = useClub();
  const c = state.draft;
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [datesFor, setDatesFor] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string[]>([]);
  const [remove, setRemove] = useState<{ session: string; age: string } | null>(
    null,
  );
  const patch = (id: string, fn: (cap: Cap) => Cap) =>
    update((c) => ({
      ...c,
      sessions: c.sessions.map((s) =>
        s.id === id ? { ...s, capacity: fn(s.capacity) } : s,
      ),
    }));
  const selected = c.sessions.find((s) => s.id === datesFor);
  return (
    <div className="capacity content">
      <Heading
        title="Max Numbers"
        description="Set the maximum number of children allowed for each session"
      />
      <div className="card stack">
        <Toggle
          right
          label="Set unlimited capacity"
          checked={c.unlimited}
          description="Remove capacity limits from all sessions, days and age groups. This overrides all session-level capacity settings below."
          onChange={(unlimited) => update((c) => ({ ...c, unlimited }))}
        />
        {c.unlimited && (
          <div className="info">
            <Icon name="info" />
            All session-level settings are currently overridden. Disable
            unlimited capacity to configure individual sessions.
          </div>
        )}
      </div>
      <p className="section-label">Session Capacity</p>
      <fieldset disabled={c.unlimited} className="stack capacity-fieldset">
        {c.sessions.map((s) => (
          <article className="capacity-card" key={s.id}>
            <div className="capacity-top">
              <span className="feature-icon blue">
                <Icon name="timer" />
              </span>
              <div className="grow">
                <strong>{s.name}</strong>
                <small>
                  {timeLabel(s.start)} – {timeLabel(s.end)}
                </small>
              </div>
              <IconButton
                name={
                  collapsed.includes(s.id) ? "chevron-down" : "chevron-left"
                }
                label={`${collapsed.includes(s.id) ? "Expand" : "Collapse"} ${s.name} capacity`}
                aria-expanded={!collapsed.includes(s.id)}
                onClick={() =>
                  setCollapsed((v) =>
                    v.includes(s.id)
                      ? v.filter((id) => id !== s.id)
                      : [...v, s.id],
                  )
                }
              />
              <Field
                label="All days"
                type="number"
                min="0"
                placeholder="--"
                value={s.capacity.all}
                onChange={(e) =>
                  patch(s.id, (cap) => ({ ...cap, all: e.target.value }))
                }
              />
            </div>
            {!collapsed.includes(s.id) && (
              <div className="capacity-body">
                <div className="custom-days stack">
                  <Toggle
                    right
                    label="Custom days"
                    description="Set a different capacity for individual weekdays."
                    checked={s.capacity.custom}
                    onChange={(custom) =>
                      patch(s.id, (cap) => ({ ...cap, custom }))
                    }
                  />
                  {s.capacity.custom && (
                    <div className="week-capacity">
                      {availableWeekdays(availableDates(s, c.dates)).map(
                        (d) => (
                          <Field
                            key={d}
                            label={weekNames[d].slice(0, 3)}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={s.capacity.weekdays[d] ?? ""}
                            onChange={(e) =>
                              patch(s.id, (cap) => ({
                                ...cap,
                                weekdays: {
                                  ...cap.weekdays,
                                  [d]: e.target.value,
                                },
                              }))
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
                <div className="divider" />
                <div className="stack">
                  <div>
                    Specific Dates
                    <small>
                      Override the usual capacity for one-off dates.
                    </small>
                  </div>
                  {Object.entries(s.capacity.dates).map(([d, v]) => (
                    <div className="row" key={d}>
                      <span className="grow">{dateLabel(d)}</span>
                      <Field
                        label="Max Capacity"
                        type="number"
                        min="0"
                        value={v}
                        onChange={(e) =>
                          patch(s.id, (cap) => ({
                            ...cap,
                            dates: { ...cap.dates, [d]: e.target.value },
                          }))
                        }
                      />
                      <IconButton
                        name="trash"
                        label={`Remove capacity override ${d}`}
                        onClick={() =>
                          patch(s.id, (cap) => ({
                            ...cap,
                            dates: Object.fromEntries(
                              Object.entries(cap.dates).filter(
                                ([x]) => x !== d,
                              ),
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="dashed"
                    icon="plus"
                    onClick={() => {
                      setDatesFor(s.id);
                      setDate(null);
                      setErr([]);
                    }}
                  >
                    Add Dates
                  </Button>
                </div>
                <div className="divider" />
                <div className="stack">
                  <div>
                    Age Group Capacity
                    <small>Set a limit for a specific age range.</small>
                  </div>
                  {s.capacity.ages.map((a) => (
                    <div className="age-row" key={a.id}>
                      {(["min", "max", "capacity"] as const).map((key, i) => (
                        <Field
                          key={key}
                          label={["Min Age", "Max Age", "Max Capacity"][i]}
                          type="number"
                          min="0"
                          value={a[key]}
                          onChange={(e) =>
                            patch(s.id, (cap) => ({
                              ...cap,
                              ages: cap.ages.map((v) =>
                                v.id === a.id
                                  ? { ...v, [key]: e.target.value }
                                  : v,
                              ),
                            }))
                          }
                        />
                      ))}
                      <IconButton
                        name="trash"
                        label="Delete age group"
                        onClick={() => setRemove({ session: s.id, age: a.id })}
                      />
                    </div>
                  ))}
                  <Button
                    variant="dashed"
                    icon="plus"
                    onClick={() =>
                      patch(s.id, (cap) => ({
                        ...cap,
                        ages: [
                          ...cap.ages,
                          { id: uid(), min: "", max: "", capacity: "" },
                        ],
                      }))
                    }
                  >
                    Add Age Group
                  </Button>
                </div>
              </div>
            )}
          </article>
        ))}
      </fieldset>
      {selected && !date && (
        <Modal
          title="Add Dates"
          description="Select days to edit capacity for each session"
          width={1034}
          onClose={() => setDatesFor(null)}
        >
          <CalendarGrid
            compact
            allowed={availableDates(selected, c.dates)}
            selected={Object.keys(selected.capacity.dates)}
            onSelect={(d) => {
              setDate(d);
              setValue(selected.capacity.dates[d] ?? "");
            }}
          />
        </Modal>
      )}
      {selected && date && (
        <Modal
          title={dateLabel(date)}
          width={529}
          onClose={() => setDate(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDate(null)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  if (value === "" || +value < 0 || !Number.isInteger(+value)) {
                    setErr(["Enter a whole-number capacity of zero or more."]);
                    return;
                  }
                  patch(selected.id, (cap) => ({
                    ...cap,
                    dates: { ...cap.dates, [date]: value },
                  }));
                  setDate(null);
                  setErr([]);
                }}
              >
                Save
              </Button>
            </>
          }
        >
          <Errors errors={err} />
          <div className="row card">
            <div className="grow">
              {selected.name}
              <small>
                {timeLabel(selected.start)} – {timeLabel(selected.end)}
              </small>
            </div>
            <Field
              label="Max Capacity"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Delete age group"
          description="Remove this age-group capacity limit?"
          danger
          label="Delete"
          onCancel={() => setRemove(null)}
          onConfirm={() => {
            patch(remove.session, (cap) => ({
              ...cap,
              ages: cap.ages.filter((a) => a.id !== remove.age),
            }));
            setRemove(null);
          }}
        />
      )}
    </div>
  );
}
