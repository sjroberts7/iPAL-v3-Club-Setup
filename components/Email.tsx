"use client";
import { useEffect, useRef, useState } from "react";
import { useClub } from "@/lib/store";
import { uid } from "@/lib/model";
import { registerFields, templates } from "@/lib/demo-data";
import {
  Heading,
  Button,
  IconButton,
  Toggle,
  Field,
  CheckOption,
  Modal,
  RadioOption,
  readUpload,
  Errors,
  Confirm,
} from "./ui";
export function Email() {
  const { state, update } = useClub();
  const c = state.draft,
    e = c.email;
  const editor = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const imageInput = useRef<HTMLInputElement>(null),
    attachmentInput = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false),
    [format, setFormat] = useState(false),
    [template, setTemplate] = useState(false),
    [chosen, setChosen] = useState(0),
    [error, setError] = useState<string[]>([]),
    [replace, setReplace] = useState(false);
  const patch = (p: Partial<typeof e>) =>
    update((c) => ({ ...c, email: { ...c.email, ...p } }));
  useEffect(() => {
    if (editor.current) editor.current.innerHTML = e.html;
  }, []);
  const save = () => patch({ html: editor.current?.innerHTML ?? "" });
  const remember = () => {
    const s = window.getSelection();
    if (s?.rangeCount && editor.current?.contains(s.anchorNode))
      range.current = s.getRangeAt(0).cloneRange();
  };
  const restore = () => {
    editor.current?.focus();
    if (range.current) {
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(range.current);
    }
  };
  const command = (name: string) => {
    restore();
    document.execCommand(name, false);
    save();
    remember();
  };
  const insertImage = async (file: File) => {
    try {
      if (
        !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
          file.type,
        )
      )
        throw Error("Choose a PNG, JPEG, WebP or GIF image.");
      const data = await readUpload(file);
      setError([]);
      restore();
      const img = document.createElement("img");
      img.src = data;
      img.alt = file.name;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "240px";
      if (range.current) {
        range.current.deleteContents();
        range.current.insertNode(img);
        range.current.setStartAfter(img);
        range.current.collapse(true);
      } else editor.current?.appendChild(img);
      save();
    } catch (err) {
      setError([(err as Error).message]);
    }
  };
  const applyTemplate = () => {
    const html = templates[chosen].html.replaceAll(
      "{{clubName}}",
      c.name.replace(
        /[&<>"']/g,
        (x) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[x]!,
      ),
    );
    if (editor.current) editor.current.innerHTML = html;
    patch({ html });
    setTemplate(false);
    setReplace(false);
  };
  return (
    <div className="email content">
      <Heading
        title="Create Booking Confirmation Email"
        description="This email will be sent to your customers once they have booked on to this club"
        optional
      />
      <Errors errors={error} />
      <div className="email-editor">
        <div
          ref={editor}
          className="editable"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Booking confirmation email"
          data-placeholder="Click insert for more options"
          onInput={save}
          onKeyUp={remember}
          onMouseUp={remember}
          onBlur={remember}
          onPaste={(ev) => {
            ev.preventDefault();
            document.execCommand(
              "insertText",
              false,
              ev.clipboardData.getData("text/plain"),
            );
            save();
          }}
        />
        <div className="editor-tools">
          <div className="insert-wrapper">
            <Button
              variant="secondary"
              icon="plus"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => setMenu(!menu)}
            >
              Insert
            </Button>
            {menu && (
              <div className="insert-menu">
                {["Attachment", "Image", "Use a template"].map((name, i) => (
                  <button
                    type="button"
                    key={name}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      setMenu(false);
                      if (i === 0) attachmentInput.current?.click();
                      if (i === 1) imageInput.current?.click();
                      if (i === 2) setTemplate(true);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <IconButton
            name="type"
            label="Text formatting"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => setFormat(!format)}
          />
          {format && (
            <>
              {[
                ["bold", "bold"],
                ["italic", "italic"],
                ["underline", "underline"],
                ["list", "insertUnorderedList"],
              ].map(([name, cmd]) => (
                <IconButton
                  key={name}
                  name={name}
                  label={name}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => command(cmd)}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <input
        ref={imageInput}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(ev) => {
          if (ev.target.files?.[0]) void insertImage(ev.target.files[0]);
          ev.target.value = "";
        }}
      />
      <input
        ref={attachmentInput}
        hidden
        type="file"
        onChange={async (ev) => {
          const file = ev.target.files?.[0];
          ev.target.value = "";
          if (!file) return;
          try {
            const data = await readUpload(file);
            setError([]);
            patch({
              attachments: [
                ...e.attachments,
                { id: uid(), name: file.name, type: file.type, data },
              ],
            });
          } catch (err) {
            setError([(err as Error).message]);
          }
        }}
      />
      {!!e.attachments.length && (
        <div className="attachments">
          {e.attachments.map((a) => (
            <div className="row chip" key={a.id}>
              <a href={a.data} download={a.name}>
                {a.name}
              </a>
              <IconButton
                name="x"
                label={`Remove ${a.name}`}
                onClick={() =>
                  patch({
                    attachments: e.attachments.filter((x) => x.id !== a.id),
                  })
                }
              />
            </div>
          ))}
        </div>
      )}
      <section className="register-email stack">
        <Toggle
          label="Email Registers"
          checked={e.registers}
          onChange={(registers) => patch({ registers })}
          description="Allow your staff members to receive a copy of the register for this club"
        />
        {e.registers && (
          <>
            <Field
              label="Email Addresses"
              value={e.addresses}
              onChange={(ev) => patch({ addresses: ev.target.value })}
              help="For multiple emails separate by comma"
              placeholder="registers@example.com"
            />
            <div className="register-time">
              <Field
                label="What time of the day should the email be sent?"
                type="time"
                value={e.time}
                onChange={(ev) => patch({ time: ev.target.value })}
              />
            </div>
            <div className="register-fields">
              {registerFields.map((v) => (
                <CheckOption
                  label={v}
                  key={v}
                  checked={e.fields.includes(v)}
                  onChange={() =>
                    patch({
                      fields: e.fields.includes(v)
                        ? e.fields.filter((x) => x !== v)
                        : [...e.fields, v],
                    })
                  }
                />
              ))}
            </div>
            <div className="register-password stack">
              <Field
                label="Update the password to open the file"
                optional
                type="password"
                autoComplete="new-password"
                value={e.password}
                onChange={(ev) => patch({ password: ev.target.value })}
              />
              <Field
                label="Confirm Password"
                optional
                type="password"
                autoComplete="new-password"
                value={e.confirm}
                onChange={(ev) => patch({ confirm: ev.target.value })}
              />
            </div>
          </>
        )}
      </section>
      {template && (
        <Modal
          title="Use a template"
          onClose={() => setTemplate(false)}
          width={650}
          footer={
            <>
              <Button variant="ghost" onClick={() => setTemplate(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  e.html.trim() ? setReplace(true) : applyTemplate()
                }
              >
                Use template
              </Button>
            </>
          }
        >
          <div className="stack">
            {templates.map((t, i) => (
              <RadioOption
                key={t.name}
                label={t.name}
                checked={chosen === i}
                onChange={() => setChosen(i)}
              />
            ))}
            <div
              className="card template-preview"
              dangerouslySetInnerHTML={{ __html: templates[chosen].html }}
            />
          </div>
        </Modal>
      )}
      {replace && (
        <Confirm
          title="Replace email content"
          description="Replace your current message with the selected template? Attachments will be kept."
          onCancel={() => setReplace(false)}
          onConfirm={applyTemplate}
          label="Use template"
        />
      )}
    </div>
  );
}
