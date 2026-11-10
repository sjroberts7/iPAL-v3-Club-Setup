"use client";
import { useEffect, useRef, useState } from "react";
import type { Club } from "@/types";
import { Provider, useClub } from "@/lib/store";
import {
  newClub,
  uid,
  validateStep,
  validateClub,
  overlapPairs,
  groupingSignature,
  dateLabel,
  money,
} from "@/lib/model";
import { demoClubs, locations } from "@/lib/demo-data";
import { Setup, Dates } from "./SetupDates";
import { Sessions, GroupModal } from "./Sessions";
import { Capacity } from "./Capacity";
import { Payments, Restrictions, Fees, Discounts } from "./Configuration";
import { Email } from "./Email";
import { Review } from "./Review";
import { TileFlow } from "./Tiles";
import {
  Button,
  Icon,
  IconButton,
  Errors,
  Confirm,
  Modal,
  Field,
  Select,
  Toggle,
  CheckOption,
  Heading,
} from "./ui";
const steps = [
  "Setup",
  "Dates",
  "Sessions",
  "Max Numbers",
  "Payments",
  "Restrictions",
  "Fees",
  "Discounts",
  "Email",
];
const icons = [
  "settings",
  "calendar-plus",
  "timer",
  "users",
  "tickets",
  "tickets",
  "pound",
  "discount",
  "mail",
];
function Wizard() {
  const { state, setState, update } = useClub();
  const { draft: c, step } = state;
  const [errors, setErrors] = useState<string[]>([]);
  const [exit, setExit] = useState(false),
    [group, setGroup] = useState(false);
  const [returnReview, setReturnReview] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroll.current?.scrollTo(0, 0);
    setErrors([]);
  }, [step]);
  const go = (n: number) => setState((s) => ({ ...s, step: n }));
  const advance = () => {
    setState((s) => ({
      ...s,
      completed: Array.from(new Set([...s.completed, step])),
      step: returnReview ? 9 : step + 1,
    }));
    setReturnReview(false);
  };
  const next = () => {
    const e = validateStep(c, step, state.membershipEnabled);
    setErrors(e);
    if (e.length) {
      scroll.current?.scrollTo(0, 0);
      return;
    }
    if (
      step === 2 &&
      overlapPairs(c).length &&
      c.groupSignature !== groupingSignature(c)
    ) {
      setGroup(true);
      return;
    }
    advance();
  };
  const create = () => {
    const issues = validateClub(c, state.membershipEnabled);
    if (issues.length) {
      setErrors(
        issues.flatMap((x) => x.errors.map((e) => `${steps[x.step]}: ${e}`)),
      );
      scroll.current?.scrollTo(0, 0);
      return;
    }
    if (overlapPairs(c).length && c.groupSignature !== groupingSignature(c)) {
      setReturnReview(true);
      go(2);
      setGroup(true);
      return;
    }
    const created = {
      ...structuredClone(c),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      clubs: [...s.clubs.filter((x) => x.id !== c.id), created],
      selectedId: created.id,
      view: "success",
      completed: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    }));
  };
  const views = [
    <Setup key="setup" />,
    <Dates key="dates" />,
    <Sessions key="sessions" />,
    <Capacity key="capacity" />,
    <Payments key="payments" />,
    <Restrictions key="restrictions" />,
    <Fees key="fees" />,
    <Discounts key="discounts" />,
    <Email key="email" />,
  ];
  return (
    <div className="wizard">
      <header className="wizard-header">
        <h1>Create Club</h1>
        <IconButton
          name="x"
          label="Exit create club"
          onClick={() => setExit(true)}
        />
      </header>
      <div className={`wizard-main step-${step}`}>
        <nav className="progress" aria-label="Club setup progress">
          {steps.map((label, i) => (
            <div className="progress-pair" key={label}>
              <button
                type="button"
                className={`progress-step ${i === step ? "active" : ""} ${state.completed.includes(i) || step === 9 ? "complete" : ""}`}
                onClick={() => {
                  if (i <= step || state.completed.includes(i)) {
                    if (step === 9) setReturnReview(true);
                    go(i);
                  } else next();
                }}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}`}
              >
                <span className="step-icon">
                  <Icon
                    name={
                      (state.completed.includes(i) && i !== step) || step === 9
                        ? "check"
                        : icons[i]
                    }
                  />
                </span>
                <span>{label}</span>
              </button>
              {i < 8 && (
                <span className={`progress-line ${i < step ? "filled" : ""}`} />
              )}
            </div>
          ))}
        </nav>
        <div className="wizard-scroll" ref={scroll}>
          <div className="error-wrap">
            <Errors errors={errors} />
          </div>
          {step === 9 ? (
            <Review
              club={c}
              membership={state.membershipEnabled}
              onEdit={(n) => {
                setReturnReview(true);
                go(n);
              }}
            />
          ) : (
            views[step]
          )}
        </div>
      </div>
      <footer className="wizard-footer">
        <div>
          {step > 0 && (
            <Button
              variant="outline"
              icon="chevron-left"
              onClick={() => go(step - 1)}
            >
              Previous
            </Button>
          )}
        </div>
        <div className="row">
          {returnReview && (
            <Button variant="outline" onClick={next}>
              Save and return to review
            </Button>
          )}
          {(step > 0 || !!c.bookingType) && (
            <Button
              variant={step === 9 ? "success" : "primary"}
              onClick={step === 9 ? create : next}
              disabled={step === 2 && !c.sessions.length}
            >
              {step === 9
                ? "Create Club"
                : step === 8
                  ? "Review Club"
                  : "Continue"}
              <Icon name={step === 9 ? "check" : "chevron-right"} />
            </Button>
          )}
        </div>
      </footer>
      {exit && (
        <Confirm
          title="Exit create club"
          description="Any unsaved changes will be lost"
          onCancel={() => setExit(false)}
          onConfirm={() =>
            setState((s) => ({
              ...s,
              view: "clubs",
              draft: newClub(),
              step: 0,
              completed: [],
            }))
          }
        />
      )}
      {group && (
        <GroupModal
          club={c}
          onClose={() => setGroup(false)}
          onSave={(groups) => {
            update((c) => ({
              ...c,
              sessions: c.sessions.map((s) => ({
                ...s,
                group: groups[s.id] || s.group,
              })),
              groupSignature: groupingSignature(c),
            }));
            setGroup(false);
            advance();
          }}
        />
      )}
    </div>
  );
}
function Clubs() {
  const { state, setState } = useClub();
  const [tile, setTile] = useState(false),
    [query, setQuery] = useState(""),
    [archived, setArchived] = useState(false),
    [columns, setColumns] = useState(false),
    [filter, setFilter] = useState(false),
    [settings, setSettings] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    status: "",
    tile: "",
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [visibleCols, setVisibleCols] = useState([
    "Dates",
    "Places",
    "Waiting list",
    "Status",
  ]);
  const [confirm, setConfirm] = useState<{
    club: Club;
    action: "archive" | "copy";
  } | null>(null);
  const [places, setPlaces] = useState<Club | null>(null);
  const [page, setPage] = useState(1),
    [perPage, setPerPage] = useState("10");
  const all = [
    ...state.clubs,
    ...demoClubs().filter((c) => !state.clubs.some((x) => x.id === c.id)),
  ];
  const rows = all.filter(
    (c) =>
      !!c.archived === archived &&
      `${c.name} ${c.location}`.toLowerCase().includes(query.toLowerCase()) &&
      (!activeFilters.location || c.location === activeFilters.location) &&
      (!activeFilters.tile || c.tile.name === activeFilters.tile) &&
      (!activeFilters.status ||
        (activeFilters.status === "Live"
          ? c.sessions.some((s) => s.live)
          : !c.sessions.some((s) => s.live))),
  );
  const pages = Math.max(1, Math.ceil(rows.length / +perPage));
  const open = (club: Club) =>
    setState((s) => ({
      ...s,
      selectedId: club.id,
      view: "view",
      draft: structuredClone(club),
    }));
  const edit = (club: Club, step = 0) =>
    setState((s) => ({
      ...s,
      draft: structuredClone(club),
      step,
      completed: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      view: "wizard",
    }));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-symbol">i</span>
          <strong>iPAL</strong>
        </div>
        <div className="nav-label">
          <Icon name="home" />
          Home
        </div>
        {[
          ["register", "Registers"],
          ["calendar", "Calendar"],
          ["image", "Gallery"],
          ["mail", "Communication"],
          ["crown", "Memberships"],
          ["tickets", "Booking Management"],
        ].map(([icon, label]) => (
          <div className="nav-label" key={label}>
            <Icon name={icon} />
            {label}
          </div>
        ))}
        <div className="nav-label">
          <Icon name="edit" />
          Club Management
        </div>
        <div className="nav-sub active">Clubs</div>
        {["Parties", "Booking Tiles", "Locations"].map((x) => (
          <div className="nav-sub" key={x}>
            {x}
          </div>
        ))}
        {[
          ["users", "Preschool Management"],
          ["users", "Customers"],
          ["reports", "Reports"],
          ["chart", "Analytics"],
          ["wallet", "Financials"],
          ["book", "Resources"],
        ].map(([icon, label]) => (
          <div className="nav-label" key={label}>
            <Icon name={icon} />
            {label}
          </div>
        ))}
      </aside>
      <main className="club-main">
        <header className="app-header">
          <Icon name="panel" />
          <div className="grow" />
          <span className="avatars">
            <span>LS</span>
            <span>MS</span>
            <span>SR</span>
            <span>JC</span>
          </span>
          <span className="header-label">Greystoke Primary School</span>
          <IconButton
            name="settings"
            label="Demonstration settings"
            onClick={() => setSettings(true)}
          />
        </header>
        <div className="club-content">
          <h1>Clubs</h1>
          <div className="club-toolbar">
            <input
              aria-label="Search clubs"
              placeholder="Search clubs"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <Button variant="outline" onClick={() => setFilter(true)}>
              Apply Filter
            </Button>
            <div className="grow" />
            <div className="relative">
              <Button variant="outline" onClick={() => setColumns(!columns)}>
                Edit Columns <Icon name="chevron-down" />
              </Button>
              {columns && (
                <div className="column-menu">
                  {["Dates", "Places", "Waiting list", "Status"].map((x) => (
                    <CheckOption
                      key={x}
                      label={x}
                      checked={visibleCols.includes(x)}
                      onChange={() =>
                        setVisibleCols(
                          visibleCols.includes(x)
                            ? visibleCols.filter((c) => c !== x)
                            : [...visibleCols, x],
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              icon="archive"
              onClick={() => {
                setArchived(!archived);
                setPage(1);
              }}
            >
              {archived ? "View Active" : "View Archived"}
            </Button>
            <Button icon="plus" onClick={() => setTile(true)}>
              Create Club
            </Button>
          </div>
          <div className="table-wrap">
            <table className="clubs-table">
              <thead>
                <tr>
                  <th>Club</th>
                  {visibleCols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows
                  .slice(
                    (Math.min(page, pages) - 1) * +perPage,
                    Math.min(page, pages) * +perPage,
                  )
                  .map((c) => (
                    <tr key={c.id}>
                      <td>
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => open(c)}
                        >
                          {c.name}
                          <small>{c.location}</small>
                          <small>#{c.id.slice(0, 6).toUpperCase()}</small>
                        </button>
                      </td>
                      {visibleCols.map((col) => (
                        <td key={col}>
                          {col === "Dates" ? (
                            <>
                              {dateLabel(c.dates[0])}
                              <br />↳ {dateLabel(c.dates.at(-1) || "")}
                            </>
                          ) : col === "Places" ? (
                            <Button
                              variant="outline"
                              onClick={() => setPlaces(c)}
                            >
                              0
                            </Button>
                          ) : col === "Waiting list" ? (
                            <span>{c.waiting ? "Enabled" : "—"}</span>
                          ) : (
                            <Toggle
                              label={`${c.name} live`}
                              checked={c.sessions.some((s) => s.live)}
                              onChange={(live) =>
                                setState((s) => {
                                  const changed = {
                                    ...c,
                                    sessions: c.sessions.map((x) => ({
                                      ...x,
                                      live,
                                    })),
                                  };
                                  return {
                                    ...s,
                                    clubs: [
                                      ...s.clubs.filter((x) => x.id !== c.id),
                                      changed,
                                    ],
                                  };
                                })
                              }
                            />
                          )}
                        </td>
                      ))}
                      <td>
                        <div className="row">
                          <IconButton
                            name="edit"
                            label={`Edit ${c.name}`}
                            onClick={() => edit(c)}
                          />
                          <IconButton
                            name="users"
                            label={`Max Numbers for ${c.name}`}
                            onClick={() => edit(c, 3)}
                          />
                          <IconButton
                            name="calendar"
                            label={`View ${c.name}`}
                            onClick={() => open(c)}
                          />
                          <IconButton
                            name="copy"
                            label={`Copy ${c.name}`}
                            onClick={() =>
                              setConfirm({ club: c, action: "copy" })
                            }
                          />
                          <IconButton
                            name="archive"
                            label={`${c.archived ? "Restore" : "Archive"} ${c.name}`}
                            onClick={() =>
                              setConfirm({ club: c, action: "archive" })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!rows.length && <p className="pad muted">No clubs found.</p>}
          </div>
          <div className="pagination">
            <Select
              label="Rows per page"
              value={perPage}
              options={["5", "10", "25"]}
              onChange={(v) => {
                setPerPage(v || "10");
                setPage(1);
              }}
            />
            <span>
              Page {Math.min(page, pages)} of {pages}
            </span>
            <IconButton
              name="chevron-left"
              label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            />
            <IconButton
              name="chevron-right"
              label="Next page"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            />
          </div>
        </div>
      </main>
      {tile && (
        <TileFlow
          onClose={() => setTile(false)}
          onComplete={() => {
            setTile(false);
            setState((s) => ({ ...s, view: "wizard", step: 0, completed: [] }));
          }}
        />
      )}
      {filter && (
        <Modal
          title="Apply Filters"
          description="Choose options to refine your search"
          onClose={() => setFilter(false)}
          width={400}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  const f = { location: "", status: "", tile: "" };
                  setFilters(f);
                  setActiveFilters(f);
                  setPage(1);
                  setFilter(false);
                }}
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => {
                  setActiveFilters(filters);
                  setPage(1);
                  setFilter(false);
                }}
              >
                Apply Filter
              </Button>
            </>
          }
        >
          <div className="stack">
            <Select
              label="Booking Tile"
              value={filters.tile}
              options={[...new Set(all.map((c) => c.tile.name))]}
              onChange={(tile) => setFilters({ ...filters, tile })}
            />
            <Select
              label="Location"
              value={filters.location}
              options={locations}
              onChange={(location) => setFilters({ ...filters, location })}
            />
            <Select
              label="Status"
              value={filters.status}
              options={["Live", "Not live"]}
              onChange={(status) => setFilters({ ...filters, status })}
            />
          </div>
        </Modal>
      )}
      {settings && (
        <Modal
          title="Demonstration settings"
          onClose={() => setSettings(false)}
          footer={<Button onClick={() => setSettings(false)}>Done</Button>}
        >
          <Toggle
            label="Membership feature enabled"
            description="Controls the availability of Members Price."
            checked={state.membershipEnabled}
            onChange={(membershipEnabled) =>
              setState((s) => ({ ...s, membershipEnabled }))
            }
          />
        </Modal>
      )}
      {confirm && (
        <Confirm
          title={
            confirm.action === "copy"
              ? "Copy Club"
              : confirm.club.archived
                ? "Restore Club"
                : "Archive Club"
          }
          description={
            confirm.action === "copy"
              ? `Create an editable copy of ${confirm.club.name}?`
              : `Do you want to ${confirm.club.archived ? "restore" : "archive"} ${confirm.club.name}?`
          }
          label={confirm.action === "copy" ? "Copy Club" : "Confirm"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.action === "copy")
              edit({
                ...structuredClone(confirm.club),
                id: uid(),
                name: `${confirm.club.name} (copy)`,
                createdAt: undefined,
              });
            else
              setState((s) => ({
                ...s,
                clubs: [
                  ...s.clubs.filter((x) => x.id !== confirm.club.id),
                  { ...confirm.club, archived: !confirm.club.archived },
                ],
              }));
            setConfirm(null);
          }}
        />
      )}
      {places && (
        <Modal
          title="Places Filled"
          width={854}
          onClose={() => setPlaces(null)}
        >
          <table>
            <thead>
              <tr>
                <th>Available Dates</th>
                {places.sessions.map((s) => (
                  <th key={s.id}>{s.name}</th>
                ))}
                <th>Unique Children</th>
              </tr>
            </thead>
            <tbody>
              {places.dates.map((d) => (
                <tr key={d}>
                  <td>{dateLabel(d)}</td>
                  {places.sessions.map((s) => (
                    <td key={s.id}>
                      0 /{" "}
                      {places.unlimited
                        ? "Unlimited"
                        : s.capacity.dates[d] || s.capacity.all || "—"}
                    </td>
                  ))}
                  <td>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}
function App() {
  const { state, setState, ready, storageError } = useClub();
  const [reset, setReset] = useState(false);
  if (!ready) return <div className="loading">Loading iPAL…</div>;
  const created =
    state.clubs.find((c) => c.id === state.selectedId) ?? state.draft;
  const newDemo = () => {
    setState((s) => ({
      ...s,
      draft: newClub(),
      completed: [],
      step: 0,
      view: "clubs",
    }));
    setReset(false);
  };
  return (
    <>
      {storageError && (
        <div className="storage-error" role="alert">
          {storageError}
        </div>
      )}
      {state.view === "wizard" ? (
        <Wizard />
      ) : state.view === "clubs" ? (
        <Clubs />
      ) : state.view === "success" ? (
        <div className="success-screen">
          <div className="success-icon">
            <Icon name="check" size={40} />
          </div>
          <h1>Club created successfully</h1>
          <p>
            <strong>{created.name}</strong> is ready to view.
          </p>
          <p className="muted">Your club has been saved on this device.</p>
          <div className="row">
            <Button variant="outline" onClick={newDemo}>
              Create another club
            </Button>
            <Button onClick={() => setState((s) => ({ ...s, view: "view" }))}>
              View Club
            </Button>
          </div>
        </div>
      ) : (
        <div className="saved-view">
          <header className="wizard-header">
            <h1>Club Details</h1>
            <Button
              variant="outline"
              icon="chevron-left"
              onClick={() => setState((s) => ({ ...s, view: "clubs" }))}
            >
              Back to Clubs
            </Button>
          </header>
          <Review
            club={created}
            membership={state.membershipEnabled}
            readOnly
            onEdit={(n) =>
              setState((s) => ({
                ...s,
                draft: structuredClone(created),
                step: n,
                completed: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                view: "wizard",
              }))
            }
          />
        </div>
      )}
      {state.view !== "wizard" && (
        <button
          type="button"
          className="demo-reset"
          onClick={() => setReset(true)}
        >
          Reset demonstration
        </button>
      )}
      {reset && (
        <Confirm
          title="Reset demonstration"
          description="Clear the current draft and all clubs created in this browser? Demonstration examples will remain available."
          danger
          label="Reset demonstration"
          onCancel={() => setReset(false)}
          onConfirm={() => {
            setState((s) => ({
              ...s,
              clubs: [],
              draft: newClub(),
              completed: [],
              step: 0,
              view: "clubs",
              selectedId: null,
            }));
            setReset(false);
          }}
        />
      )}
    </>
  );
}
export default function Prototype() {
  return (
    <Provider>
      <App />
    </Provider>
  );
}
