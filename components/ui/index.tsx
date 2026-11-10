"use client";
import React, { useEffect, useRef, useState, useId } from "react";
import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Copy,
  Trash2,
  SquarePen,
  Info,
  Calendar,
  Clock,
  Grip,
  Settings,
  Users,
  Tickets,
  PoundSterling,
  BadgePercent,
  Mail,
  CalendarPlus,
  CalendarDays,
  FilePenLine,
  CalendarClock,
  Handshake,
  BusFront,
  Utensils,
  Search,
  Archive,
  ArrowLeftRight,
  House,
  UserCheck,
  Image as ImageIcon,
  Crown,
  ClipboardList,
  ChartNoAxesColumn,
  Wallet,
  Book,
  PanelLeftClose,
  Bold,
  Italic,
  Underline,
  List,
  Type,
  Paperclip,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
const icons: Record<string, React.ElementType> = {
  x: X,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  plus: Plus,
  check: Check,
  copy: Copy,
  trash: Trash2,
  edit: SquarePen,
  info: Info,
  calendar: Calendar,
  timer: Clock,
  grip: Grip,
  settings: Settings,
  users: Users,
  tickets: Tickets,
  pound: PoundSterling,
  discount: BadgePercent,
  mail: Mail,
  "calendar-plus": CalendarPlus,
  "calendar-days": CalendarDays,
  "file-pen-line": FilePenLine,
  "calendar-clock": CalendarClock,
  handshake: Handshake,
  "bus-front": BusFront,
  utensils: Utensils,
  search: Search,
  archive: Archive,
  swap: ArrowLeftRight,
  home: House,
  register: UserCheck,
  image: ImageIcon,
  crown: Crown,
  reports: ClipboardList,
  chart: ChartNoAxesColumn,
  wallet: Wallet,
  book: Book,
  panel: PanelLeftClose,
  bold: Bold,
  italic: Italic,
  underline: Underline,
  list: List,
  type: Type,
  paperclip: Paperclip,
  download: Download,
  up: ArrowUp,
  down: ArrowDown,
};
const figmaAssets: Record<string, string> = {
  grip: "ab520.svg",
  edit: "1338f.svg",
  trash: "8789c.svg",
  calendar: "b1890.svg",
  "chevron-left": "35360.svg",
  "chevron-right": "3599b.svg",
  users: "d0a56.svg",
  tickets: "8245a.svg",
  pound: "80893.svg",
  discount: "30523.svg",
  mail: "01694.svg",
};
export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const C = icons[name] || Info;
  return figmaAssets[name] && size === 16 ? (
    <img className="icon" src={"/assets/" + figmaAssets[name]} alt="" />
  ) : (
    <C size={size} strokeWidth={1.5} aria-hidden="true" />
  );
}
export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  icon?: string;
}) {
  return (
    <button
      type="button"
      {...props}
      onClick={onClick}
      className={`btn ${variant} ${props.className || ""}`}
    >
      {icon && <Icon name={icon} />} {children}
    </button>
  );
}
export function IconButton({
  name,
  label,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  label: string;
}) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      title={label}
      className={`icon-btn ${props.className || ""}`}
    >
      <Icon name={name} />
    </button>
  );
}
export function Optional() {
  return <span className="optional">Optional</span>;
}
export function Heading({
  title,
  description,
  optional = false,
  small = false,
}: {
  title: string;
  description?: string;
  optional?: boolean;
  small?: boolean;
}) {
  return (
    <div className="heading">
      <div className="row">
        <h2 className={small ? "small" : ""}>{title}</h2>
        {optional && <Optional />}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Field({
  label,
  help,
  optional,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  optional?: boolean;
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional && <Optional />}
      </label>
      {children || (
        <input
          {...props}
          id={id}
          onInput={(e) => {
            props.onInput?.(e);
            if (props.type === "time" || props.type === "date")
              props.onChange?.({ ...e, target: e.currentTarget });
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
            if (props.type === "time" || props.type === "date")
              props.onChange?.({ ...e, target: e.currentTarget });
          }}
        />
      )}{" "}
      {help && <small>{help}</small>}
    </div>
  );
}
export function Money({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="money-input">
        <span>£</span>
        <input
          aria-label={label}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </Field>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="select">
        <select
          aria-label={label}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <Icon name="chevron-down" />
      </div>
    </div>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  right = false,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
  description?: string;
  disabled?: boolean;
  right?: boolean;
}) {
  return (
    <div className={`toggle-row ${right ? "right" : ""}`}>
      <button
        type="button"
        className={`switch ${checked ? "on" : ""}`}
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
      {label && (
        <div className="toggle-copy">
          <span onClick={() => !disabled && onChange(!checked)}>{label}</span>
          {description && <small>{description}</small>}
        </div>
      )}
    </div>
  );
}
export function CheckOption({
  label,
  checked,
  onChange,
  card = false,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  card?: boolean;
  description?: string;
}) {
  return (
    <label
      className={`check-option ${card ? "choice" : ""} ${checked ? "selected" : ""}`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-dot">{checked && <Check size={11} />}</span>
      <span>
        {label}
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}
export function RadioOption({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  icon?: string;
}) {
  return (
    <button
      type="button"
      className={`choice radio-choice ${checked ? "selected" : ""}`}
      onClick={onChange}
      role="radio"
      aria-checked={checked}
    >
      {icon && (
        <span className="feature-icon">
          <Icon name={icon} />
        </span>
      )}
      <span className="grow">
        {label}
        {description && <small>{description}</small>}
      </span>
      <span className="radio-dot">{checked && <span />}</span>
    </button>
  );
}
export function Errors({ errors }: { errors: string[] }) {
  return errors.length ? (
    <div role="alert" className="errors">
      {errors.map((e) => (
        <p key={e}>{e}</p>
      ))}
    </div>
  ) : null;
}
export function Modal({
  title,
  description,
  children,
  onClose,
  footer,
  width = 510,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[contenteditable="true"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`modal ${className}`}
        style={{ width }}
      >
        <div className="modal-head">
          <div>
            <h3 id={id}>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <IconButton name="x" label="Close dialog" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
export function Confirm({
  title,
  description,
  onCancel,
  onConfirm,
  label = "Confirm",
  danger = false,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  label?: string;
  danger?: boolean;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {label}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
}
export async function readUpload(file: File): Promise<string> {
  if (file.size > 1.5 * 1024 * 1024)
    throw Error(
      "Please choose a file smaller than 1.5 MB for this demonstration.",
    );
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(Error("Unable to read this file."));
    reader.readAsDataURL(file);
  });
}
