"use client";
import { useState } from "react";
import type { Club, Discount, Fee } from "@/types";
import { useClub } from "@/lib/store";
import {
  locations,
  years,
  classes,
  categories,
  accounts,
} from "@/lib/demo-data";
import { uid, timeLabel, feeTrigger, money } from "@/lib/model";
import {
  Heading,
  Toggle,
  Select,
  Field,
  CheckOption,
  Button,
  Icon,
  IconButton,
  Money,
  Confirm,
  Optional,
} from "./ui";
import { PeoplePicker, CopyClubModal } from "./SetupDates";
export const paymentLabels: Record<string, string> = {
  card: "Card Payments",
  monthly: "Auto Monthly Card Payments (Rapyd Only)",
  outstanding: "Outstanding Only",
  taxFree: "Auto Government Tax Free Childcare Vouchers",
  wallet: "Wallet Funds",
  whenDue: "Pay When Due",
  partial: "Partial Payments / Monthly Instalments",
  equal: "Allow Equal Instalments",
};
export function Payments() {
  const { state, update } = useClub();
  const p = state.draft.payments;
  const toggle = (key: keyof typeof p) => (
    <Toggle
      key={key}
      label={paymentLabels[key]}
      checked={Boolean(p[key])}
      onChange={(v) =>
        update((c) => ({ ...c, payments: { ...c.payments, [key]: v } }))
      }
      description={
        key === "equal"
          ? "This will split the whole year bill end price into equal amounts across the months"
          : undefined
      }
    />
  );
  return (
    <div className="payments content stack">
      <section className="stack">
        <Heading
          small
          title="Payment Methods"
          description="Decide what methods you want your customers to pay with"
        />
        {toggle("card")}
        {toggle("monthly")}
        {p.monthly && <div className="indent">{toggle("outstanding")}</div>}
        {toggle("taxFree")}
        {toggle("wallet")}
      </section>
      <section className="stack">
        <Heading small title="Payment Options" optional />
        {toggle("whenDue")}
        {toggle("partial")}
        {p.partial && <div className="indent">{toggle("equal")}</div>}
      </section>
      <section className="stack">
        <Heading small title="Payment Category" optional />
        <p>Please select the appropriate income category for this club</p>
        <div className="payment-select">
          <Select
            label="Payment Category"
            value={p.category}
            options={categories}
            onChange={(category) =>
              update((c) => ({ ...c, payments: { ...c.payments, category } }))
            }
          />
          <Select
            label="Add a new payment account"
            value={p.account}
            options={accounts}
            onChange={(account) =>
              update((c) => ({ ...c, payments: { ...c.payments, account } }))
            }
          />
        </div>
      </section>
    </div>
  );
}
export function Restrictions() {
  const { state, update } = useClub();
  const r = state.draft.restrictions;
  const patch = (p: Partial<typeof r>) =>
    update((c) => ({ ...c, restrictions: { ...c.restrictions, ...p } }));
  const rows = [
    [
      "age",
      "Restrict by Age Limit",
      "Enter the age range you want this club to be restricted to",
    ],
    [
      "location",
      "Restrict by Location",
      "Select the locations you want to restrict by",
    ],
    [
      "year",
      "Restrict by Year Group",
      "Select the year groups you want to restrict by",
    ],
    [
      "class",
      "Restrict by Class",
      "Select the classes you want to restrict by",
    ],
    [
      "child",
      "Restrict Child From Booking",
      "Select the children you want to restrict from booking",
    ],
  ] as const;
  return (
    <div className="restrictions content stack">
      <Heading
        title="Restrictions"
        description="Restrict your club by age, year, location, class or child"
        optional
      />
      {rows.map(([key, label, description]) => (
        <div key={key} className="restriction-card">
          <div className="pad">
            <Toggle
              right
              label={label}
              description={r[key] ? description : undefined}
              checked={r[key]}
              onChange={(v) => patch({ [key]: v })}
            />
          </div>
          {r[key] && (
            <div className="restriction-body">
              {key === "age" ? (
                <div className="grid2">
                  <Field
                    label="Age From"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={r.min}
                    onChange={(e) => patch({ min: e.target.value })}
                  />
                  <Field
                    label="Age to"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={r.max}
                    onChange={(e) => patch({ max: e.target.value })}
                  />
                </div>
              ) : key === "child" ? (
                <>
                  <PeoplePicker
                    label="Select child"
                    selected={r.children}
                    onChange={(children) => patch({ children })}
                  />
                  <small>Selected children cannot book this club.</small>
                </>
              ) : (
                <>
                  <div className="choices">
                    {(key === "location"
                      ? locations
                      : key === "year"
                        ? years
                        : classes
                    ).map((v) => {
                      const values =
                        key === "location"
                          ? r.locations
                          : key === "year"
                            ? r.years
                            : r.classes;
                      const prop =
                        key === "location"
                          ? "locations"
                          : key === "year"
                            ? "years"
                            : "classes";
                      return (
                        <CheckOption
                          card
                          key={v}
                          label={v}
                          checked={values.includes(v)}
                          onChange={() =>
                            patch({
                              [prop]: values.includes(v)
                                ? values.filter((x) => x !== v)
                                : [...values, v],
                            })
                          }
                        />
                      );
                    })}
                  </div>
                  <small>
                    Only selected{" "}
                    {key === "location"
                      ? "locations"
                      : key === "year"
                        ? "year groups"
                        : "classes"}{" "}
                    are allowed to book.
                  </small>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export function Fees() {
  const { state, update } = useClub();
  const c = state.draft;
  const [id, setId] = useState(c.sessions[0]?.id);
  const selected = c.sessions.find((s) => s.id === id) ?? c.sessions[0];
  const [copy, setCopy] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const patch = (fn: (f: Fee[]) => Fee[]) => {
    if (selected)
      update((c) => ({
        ...c,
        sessions: c.sessions.map((s) =>
          s.id === selected.id ? { ...s, fees: fn(s.fees) } : s,
        ),
      }));
  };
  return (
    <div className="fees content">
      <div className="row heading-actions">
        <Heading
          title="Set Late Fees"
          description="Add multiple stage late fees to each session"
          optional
        />
        <button
          className="card copy-action"
          type="button"
          onClick={() => setCopy(true)}
        >
          <Icon name="copy" />
          <span>
            Copy late fees from club<small>Reuse existing late fees.</small>
          </span>
        </button>
      </div>
      <div className="fees-layout">
        <aside className="fee-sessions card">
          <div className="muted">Sessions</div>
          {c.sessions.map((s) => (
            <button
              type="button"
              className={`choice ${s.id === selected?.id ? "selected" : ""}`}
              key={s.id}
              onClick={() => setId(s.id)}
            >
              <span className="grow">
                {s.name}
                <small>
                  {timeLabel(s.start)} – {timeLabel(s.end)}
                </small>
              </span>
              {!!s.fees.length && (
                <span className="count-badge">
                  {s.fees.length} {s.fees.length === 1 ? "Stage" : "Stages"}
                </span>
              )}
            </button>
          ))}
        </aside>
        {selected && (
          <div className="card fee-detail">
            <Heading
              small
              title={selected.name}
              description={`${timeLabel(selected.start)} – ${timeLabel(selected.end)}`}
            />
            <div className="divider" />
            <div className="info">
              <Icon name="info" />
              Each stage triggers after the session start time has passed by the
              set delay.
            </div>
            <div className="fee-stages">
              {selected.fees.map((f, index) => (
                <div className="fee-row" key={f.id}>
                  <span className="stage-number">{index + 1}</span>
                  <Field
                    label="Time"
                    type="time"
                    value={f.delay}
                    onChange={(e) =>
                      patch((fs) =>
                        fs.map((x) =>
                          x.id === f.id ? { ...x, delay: e.target.value } : x,
                        ),
                      )
                    }
                    help={`Triggers at ${feeTrigger(selected.start, f.delay)}`}
                  />
                  <Money
                    label="Late Fee"
                    value={f.amount}
                    onChange={(amount) =>
                      patch((fs) =>
                        fs.map((x) => (x.id === f.id ? { ...x, amount } : x)),
                      )
                    }
                  />
                  <IconButton
                    name="copy"
                    label={`Duplicate stage ${index + 1}`}
                    onClick={() =>
                      patch((fs) => {
                        const out = [...fs];
                        out.splice(index + 1, 0, { ...f, id: uid() });
                        return out;
                      })
                    }
                  />
                  <IconButton
                    name="trash"
                    label={`Delete stage ${index + 1}`}
                    onClick={() => setRemove(f.id)}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="dashed neutral"
              icon="plus"
              onClick={() =>
                patch((fs) => [
                  ...fs,
                  { id: uid(), delay: "00:00", amount: "0.00" },
                ])
              }
            >
              Add Stage
            </Button>
          </div>
        )}
      </div>
      {copy && (
        <CopyClubModal
          kind="fees"
          onClose={() => setCopy(false)}
          onCopy={(source) => {
            patch(
              () =>
                source.sessions[0]?.fees.map((f) => ({ ...f, id: uid() })) ??
                [],
            );
            setCopy(false);
          }}
        />
      )}
      {remove && (
        <Confirm
          title="Delete late-fee stage"
          description="Remove this late-fee stage from the selected session?"
          danger
          label="Delete"
          onCancel={() => setRemove(null)}
          onConfirm={() => {
            patch((fs) => fs.filter((f) => f.id !== remove));
            setRemove(null);
          }}
        />
      )}
    </div>
  );
}
export const discountTypes = [
  {
    type: "promo" as const,
    label: "Promo Code",
    description: "Share a code for a percentage discount",
  },
  {
    type: "amount" as const,
    label: "Amount Based",
    description: "Discount when spend exceeds a threshold",
  },
  {
    type: "sibling" as const,
    label: "Sibling Discount",
    description: "Auto apply when a parent books multiple children",
  },
];
export function Discounts() {
  const { state, update } = useClub();
  const ds = state.draft.discounts;
  const [remove, setRemove] = useState<string | null>(null);
  const patch = (id: string, p: Partial<Discount>) =>
    update((c) => ({
      ...c,
      discounts: c.discounts.map((d) => (d.id === id ? { ...d, ...p } : d)),
    }));
  return (
    <div className="discounts content">
      <Heading
        title="Create Discounts"
        description="Add discounts your customers can benefit from. You can add multiple discounts of any type."
        optional
      />
      <div className="discount-types">
        {discountTypes.map((t) => (
          <button
            type="button"
            key={t.type}
            className={`discount-type ${t.type}`}
            onClick={() =>
              update((c) => ({
                ...c,
                discounts: [
                  ...c.discounts,
                  {
                    id: uid(),
                    type: t.type,
                    value: "",
                    code: "",
                    threshold: "",
                    siblings: "2+",
                    perCustomer: "",
                    total: "",
                    start: "",
                    end: "",
                    expanded: true,
                  },
                ],
              }))
            }
          >
            <strong>{t.label}</strong>
            <small>{t.description}</small>
            <span className="add-square">
              <Icon name="plus" />
            </span>
          </button>
        ))}
      </div>
      {!ds.length ? (
        <div className="discount-empty">
          <span className="feature-icon">
            <Icon name="discount" size={24} />
          </span>
          <p>No Discounts Yet</p>
          <small>Share a code for a percentage discount</small>
        </div>
      ) : (
        <>
          <p className="muted discount-count">
            {ds.length} {ds.length === 1 ? "Discount" : "Discounts"} Added
          </p>
          <div className="stack">
            {ds.map((d) => (
              <article key={d.id} className={`discount-card ${d.type}`}>
                <div className="discount-top">
                  <span className="colour-dot" />
                  <button
                    className="grow text-left"
                    type="button"
                    onClick={() => patch(d.id, { expanded: !d.expanded })}
                  >
                    <strong>
                      {discountTypes.find((t) => t.type === d.type)?.label}
                    </strong>
                    <small>
                      {d.value ? `${d.value}% off` : "Not yet configured"}
                    </small>
                  </button>
                  <IconButton
                    name="trash"
                    label="Delete discount"
                    onClick={() => setRemove(d.id)}
                  />
                  <IconButton
                    name={d.expanded ? "up" : "chevron-down"}
                    label={d.expanded ? "Collapse discount" : "Expand discount"}
                    aria-expanded={d.expanded}
                    onClick={() => patch(d.id, { expanded: !d.expanded })}
                  />
                </div>
                {d.expanded && (
                  <div className="discount-fields">
                    <Field label="Discount Value" help="%">
                      <div className="percent-input">
                        <input
                          aria-label="Discount Value"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g. 10"
                          value={d.value}
                          onChange={(e) =>
                            patch(d.id, { value: e.target.value })
                          }
                        />
                        <span aria-hidden="true">%</span>
                      </div>
                    </Field>
                    {d.type === "promo" ? (
                      <Field
                        label="Promo Code"
                        placeholder="e.g. SUMMER26"
                        value={d.code}
                        onChange={(e) => patch(d.id, { code: e.target.value })}
                        help="Customers enter this at checkout"
                      />
                    ) : d.type === "amount" ? (
                      <Money
                        label="Spend Threshold"
                        value={d.threshold}
                        onChange={(threshold) => patch(d.id, { threshold })}
                      />
                    ) : (
                      <Select
                        label="Sibling Count"
                        value={d.siblings}
                        options={["1+", "2+", "3+", "4+", "5+"]}
                        onChange={(siblings) => patch(d.id, { siblings })}
                      />
                    )}
                    <Field
                      label="Uses Per Customer"
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={d.perCustomer}
                      onChange={(e) =>
                        patch(d.id, { perCustomer: e.target.value })
                      }
                      help="Leave blank for unlimited"
                    />
                    <Field
                      label="Total Uses"
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={d.total}
                      onChange={(e) => patch(d.id, { total: e.target.value })}
                      help="Leave blank for unlimited"
                    />
                    <Field
                      label="Start Date"
                      optional
                      type="date"
                      value={d.start}
                      onChange={(e) => patch(d.id, { start: e.target.value })}
                    />
                    <Field
                      label="End Date"
                      optional
                      type="date"
                      value={d.end}
                      min={d.start}
                      onChange={(e) => patch(d.id, { end: e.target.value })}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      {remove && (
        <Confirm
          title="Delete discount"
          description="Remove this discount from the club?"
          danger
          label="Delete"
          onCancel={() => setRemove(null)}
          onConfirm={() => {
            update((c) => ({
              ...c,
              discounts: c.discounts.filter((d) => d.id !== remove),
            }));
            setRemove(null);
          }}
        />
      )}
    </div>
  );
}
