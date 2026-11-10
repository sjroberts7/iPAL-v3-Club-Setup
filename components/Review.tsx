"use client";
import type { Club, Pricing } from "@/types";
import {
  dateLabel,
  money,
  timeLabel,
  availableDates,
  feeTrigger,
} from "@/lib/model";
import { paymentLabels, discountTypes } from "./Configuration";
import { weekNames } from "@/lib/demo-data";
import { Heading, Button, Icon } from "./ui";
const yes = (b: boolean) => (b ? "Enabled" : "Disabled");
function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="summary-row">
      <dt>{label}</dt>
      <dd>{children || "Not set"}</dd>
    </div>
  );
}
function PriceSummary({
  p,
  membership,
  free,
}: {
  p: Pricing;
  membership: boolean;
  free: boolean;
}) {
  if (free) return <span>Free club</span>;
  return (
    <div className="summary-prices">
      <span>
        {p.type}: <strong>{money(p.standard)}</strong>
      </span>
      {p.weekly.enabled && <span>Weekly: {money(p.weekly.value)}</span>}
      {p.monthly.enabled && <span>Monthly: {money(p.monthly.value)}</span>}
      {p.within.enabled && (
        <span>
          Within {p.within.days} days: {money(p.within.value)}
        </span>
      )}
      {membership && p.members.enabled && (
        <span>Members: {money(p.members.value)}</span>
      )}
    </div>
  );
}
export function Review({
  club: c,
  onEdit,
  membership = true,
  readOnly = false,
}: {
  club: Club;
  onEdit?: (n: number) => void;
  membership?: boolean;
  readOnly?: boolean;
}) {
  const section = (step: number, title: string, children: React.ReactNode) => (
    <section className="review-card">
      <header>
        <h3>{title}</h3>
        {onEdit && (
          <Button icon="edit" variant="outline" onClick={() => onEdit(step)}>
            Edit
          </Button>
        )}
      </header>
      <div className="review-body">{children}</div>
    </section>
  );
  const r = c.restrictions,
    p = c.payments,
    e = c.email;
  return (
    <div className="review content stack">
      <Heading
        title={readOnly ? c.name : "Review Club"}
        description={
          readOnly
            ? "Club configuration"
            : "Check your club details before creating your club."
        }
      />
      {section(
        0,
        "Club Details",
        <>
          <dl>
            <SummaryRow label="Club Name">{c.name}</SummaryRow>
            <SummaryRow label="Booking Type">{c.bookingType}</SummaryRow>
            <SummaryRow label="Description">
              {c.description || "No description"}
            </SummaryRow>
            <SummaryRow label="Location">{c.location}</SummaryRow>
            <SummaryRow label="Booking Tile">{c.tile.name}</SummaryRow>
            <SummaryRow label="Tile dates">
              Live: {dateLabel(c.tile.live)} · Offline:{" "}
              {dateLabel(c.tile.offline)} · Archive: {dateLabel(c.tile.archive)}
            </SummaryRow>
            <SummaryRow label="Minimum Booking Amount">{c.minimum}</SummaryRow>
            <SummaryRow label="Cancellations">
              {c.cancellations
                ? `Allowed · cancellation period ${c.cancellationPeriod}`
                : "Not allowed"}
            </SummaryRow>
            <SummaryRow label="Waiting list">
              {c.waiting
                ? `Enabled · auto invite ${yes(c.autoInvite).toLowerCase()}`
                : "Disabled"}
            </SummaryRow>
            <SummaryRow label="Trials">{yes(c.trials)}</SummaryRow>
            <SummaryRow label="Free Club">{yes(c.free)}</SummaryRow>
            <SummaryRow label="Who’s Attending?">{c.attending}</SummaryRow>
            <SummaryRow label="Members Only">
              {c.membersOnly ? c.membership : "No"}
            </SummaryRow>
            <SummaryRow label="Private">
              {c.private ? c.attendees.join(", ") : "No"}
            </SummaryRow>
          </dl>
          {c.tile.image && (
            <img className="review-tile" alt={c.tile.name} src={c.tile.image} />
          )}
        </>,
      )}
      {section(
        1,
        "Club Dates",
        <>
          <strong>{c.dates.length} operating dates</strong>
          <p>
            {dateLabel(c.dates[0])} – {dateLabel(c.dates.at(-1) || "")}
          </p>
          <details>
            <summary>View all dates</summary>
            <div className="date-chips">
              {c.dates.map((d) => (
                <span key={d}>{dateLabel(d)}</span>
              ))}
            </div>
          </details>
        </>,
      )}
      {section(
        2,
        "Sessions and Extras",
        <div className="stack">
          {c.sessions.map((s) => (
            <div className="review-item" key={s.id}>
              <div className="row">
                <strong className="grow">{s.name}</strong>
                <span className={`status ${s.live ? "live" : ""}`}>
                  {s.live ? "Live" : "Not live"}
                </span>
              </div>
              <p>
                {timeLabel(s.start)} – {timeLabel(s.end)}
              </p>
              <p>
                Availability:{" "}
                {s.availability.mode === "all"
                  ? "All Available Dates"
                  : s.availability.mode === "weekdays"
                    ? s.availability.weekdays
                        .map((d) => weekNames[d])
                        .join(", ")
                    : "Specific Dates Only"}{" "}
                · {availableDates(s, c.dates).length} dates
              </p>
              <details>
                <summary>View session dates</summary>
                <div className="date-chips">
                  {availableDates(s, c.dates).map((d) => (
                    <span key={d}>{dateLabel(d)}</span>
                  ))}
                </div>
              </details>
              <PriceSummary
                p={s.pricing}
                membership={membership}
                free={c.free}
              />
              {c.groupSignature && <small>Capacity group {s.group}</small>}
            </div>
          ))}
          <h4>Extras</h4>
          {c.extras.length ? (
            c.extras.map((x) => (
              <div className="review-item" key={x.id}>
                <div className="row">
                  <strong className="grow">{x.name}</strong>
                  <span className={`status ${x.live ? "live" : ""}`}>
                    {x.live ? "Live" : "Not live"}
                  </span>
                </div>
                <PriceSummary
                  p={x.pricing}
                  membership={membership}
                  free={c.free}
                />
              </div>
            ))
          ) : (
            <p>No extras</p>
          )}
        </div>,
      )}
      {section(
        3,
        "Capacity",
        c.unlimited ? (
          <div className="info">
            <Icon name="info" />
            Unlimited capacity for every session. Saved individual limits are
            overridden.
          </div>
        ) : (
          <div className="stack">
            {c.sessions.map((s) => (
              <div className="review-item" key={s.id}>
                <strong>{s.name}</strong>
                <p>
                  All days: {s.capacity.all === "" ? "Not set" : s.capacity.all}
                </p>
                {s.capacity.custom && (
                  <p>
                    Custom days:{" "}
                    {Object.entries(s.capacity.weekdays)
                      .map(([d, v]) => `${weekNames[+d]}: ${v || "Not set"}`)
                      .join(" · ") || "No overrides set"}
                  </p>
                )}
                {Object.entries(s.capacity.dates).map(([d, v]) => (
                  <p key={d}>
                    {dateLabel(d)}: {v}
                  </p>
                ))}
                {s.capacity.ages.map((a) => (
                  <p key={a.id}>
                    Ages {a.min}–{a.max}: {a.capacity}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ),
      )}
      {section(
        4,
        "Payment Methods and Options",
        <dl>
          {Object.entries(paymentLabels).map(([k, label]) => (
            <SummaryRow key={k} label={label}>
              {(k === "outstanding" && !p.monthly) ||
              (k === "equal" && !p.partial)
                ? "Disabled (parent option off)"
                : yes(Boolean(p[k as keyof typeof p]))}
            </SummaryRow>
          ))}
          <SummaryRow label="Payment Category">
            {p.category || "None selected"}
          </SummaryRow>
          <SummaryRow label="Payment account">
            {p.account || "None selected"}
          </SummaryRow>
        </dl>,
      )}
      {section(
        5,
        "Restrictions",
        <dl>
          <SummaryRow label="Age Limit">
            {r.age ? `${r.min}–${r.max}` : "No restriction"}
          </SummaryRow>
          <SummaryRow label="Allowed Locations">
            {r.location ? r.locations.join(", ") : "All locations"}
          </SummaryRow>
          <SummaryRow label="Allowed Year Groups">
            {r.year ? r.years.join(", ") : "All year groups"}
          </SummaryRow>
          <SummaryRow label="Allowed Classes">
            {r.class ? r.classes.join(", ") : "All classes"}
          </SummaryRow>
          <SummaryRow label="Children NOT allowed">
            {r.child ? r.children.join(", ") : "None"}
          </SummaryRow>
        </dl>,
      )}
      {section(
        6,
        "Late Fees",
        <div className="stack">
          {c.sessions.map((s) => (
            <div key={s.id}>
              <strong>{s.name}</strong>
              {s.fees.length ? (
                s.fees.map((f, i) => (
                  <p key={f.id}>
                    Stage {i + 1}: {f.delay} after start →{" "}
                    {feeTrigger(s.start, f.delay)} · {money(f.amount)}
                  </p>
                ))
              ) : (
                <p>No late fees</p>
              )}
            </div>
          ))}
        </div>,
      )}
      {section(
        7,
        "Discounts",
        c.discounts.length ? (
          <div className="stack">
            {c.discounts.map((d) => (
              <div
                key={d.id}
                className={`review-item discount-review ${d.type}`}
              >
                <strong>
                  {discountTypes.find((t) => t.type === d.type)?.label} ·{" "}
                  {d.value}% off
                </strong>
                <p>
                  {d.type === "promo"
                    ? `Code: ${d.code}`
                    : d.type === "amount"
                      ? `Spend threshold: ${money(d.threshold)}`
                      : `Sibling count: ${d.siblings}`}
                </p>
                <p>
                  Uses per customer: {d.perCustomer || "Unlimited"} · Total
                  uses: {d.total || "Unlimited"}
                </p>
                <p>
                  Start: {dateLabel(d.start)} · End: {dateLabel(d.end)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No discounts</p>
        ),
      )}
      {section(
        8,
        "Email Configuration",
        <>
          <dl>
            <SummaryRow label="Booking Confirmation">
              {e.html.replace(/<[^>]*>/g, "").trim() || e.html.includes("<img")
                ? "Custom email configured"
                : "No email configured"}
            </SummaryRow>
            <SummaryRow label="Attachments">
              {e.attachments.length
                ? e.attachments.map((a) => (
                    <a key={a.id} href={a.data} download={a.name}>
                      {a.name}{" "}
                    </a>
                  ))
                : "None"}
            </SummaryRow>
            <SummaryRow label="Email Registers">{yes(e.registers)}</SummaryRow>
            {e.registers && (
              <>
                <SummaryRow label="Email Addresses">{e.addresses}</SummaryRow>
                <SummaryRow label="Send Time">{e.time}</SummaryRow>
                <SummaryRow label="Register Information">
                  {e.fields.join(", ") || "None selected"}
                </SummaryRow>
                <SummaryRow label="File Password">
                  {e.password ? "Password set" : "No password"}
                </SummaryRow>
              </>
            )}
          </dl>
          {e.html && (
            <details>
              <summary>Preview booking confirmation email</summary>
              <div
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: e.html }}
              />
            </details>
          )}
        </>,
      )}
    </div>
  );
}
