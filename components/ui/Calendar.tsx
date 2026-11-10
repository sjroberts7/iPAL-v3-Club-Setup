"use client";
import { useState } from "react";
import { dateKey, day, parseDate } from "@/lib/model";
import { IconButton } from "./index";
export function CalendarGrid({
  selected,
  onSelect,
  allowed,
  weekdays,
  initialYear,
  compact = false,
}: {
  selected: string[];
  onSelect: (d: string) => void;
  allowed?: string[];
  weekdays?: number[];
  initialYear?: number;
  compact?: boolean;
}) {
  const [year, setYear] = useState(
    initialYear ??
      (allowed?.[0]
        ? parseDate(allowed[0]).getFullYear()
        : new Date().getFullYear()),
  );
  const months = allowed
    ? Array.from(
        new Set(
          allowed
            .filter((d) => +d.slice(0, 4) === year)
            .map((d) => +d.slice(5, 7) - 1),
        ),
      ).sort((a, b) => a - b)
    : Array.from({ length: 12 }, (_, i) => i);
  const years = allowed
    ? Array.from(new Set(allowed.map((d) => +d.slice(0, 4)))).sort()
    : [];
  return (
    <div className={`calendar-wrap ${compact ? "compact" : ""}`}>
      <div className="year-bar">
        <h3>{year}</h3>
        <div className="line" />
        <IconButton
          name="chevron-left"
          label="Previous year"
          disabled={!!allowed && !years.some((y) => y < year)}
          onClick={() =>
            setYear(
              allowed
                ? (years.filter((y) => y < year).at(-1) ?? year)
                : year - 1,
            )
          }
        />
        <IconButton
          name="chevron-right"
          label="Next year"
          disabled={!!allowed && !years.some((y) => y > year)}
          onClick={() =>
            setYear(allowed ? (years.find((y) => y > year) ?? year) : year + 1)
          }
        />
      </div>
      <div className="calendar-grid">
        {months.map((month) => {
          const first = new Date(year, month, 1);
          const offset = (first.getDay() + 6) % 7;
          const cells = Math.max(
            35,
            Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7) *
              7,
          );
          return (
            <div className="month" key={month}>
              <div className="month-name">
                {first.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="days-grid">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <span className="day-label" key={d}>
                    {d}
                  </span>
                ))}
                {Array.from({ length: cells }, (_, i) => {
                  const date = new Date(year, month, i - offset + 1),
                    key = dateKey(date);
                  const off =
                    date.getMonth() !== month ||
                    (!!allowed && !allowed.includes(key)) ||
                    (!!weekdays && !weekdays.includes(day(key)));
                  return (
                    <button
                      type="button"
                      key={key}
                      disabled={off}
                      aria-label={key}
                      aria-pressed={selected.includes(key)}
                      className={`day ${selected.includes(key) ? "selected" : ""}`}
                      onClick={() => onSelect(key)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {!months.length && (
        <p className="muted">No configured dates in this year.</p>
      )}
    </div>
  );
}
