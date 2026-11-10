"use client";
import { useState } from "react";
import { useClub } from "@/lib/store";
import { demoClubs } from "@/lib/demo-data";
import type { Tile } from "@/types";
import {
  Modal,
  Button,
  Icon,
  Field,
  Toggle,
  readUpload,
  IconButton,
  Errors,
} from "./ui";
export function TileFlow({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const { state, update } = useClub();
  const [mode, setMode] = useState<"choose" | "existing" | "create">("choose");
  const [tile, setTile] = useState<Tile>(state.draft.tile);
  const [error, setError] = useState<string[]>([]);
  const patch = (p: Partial<Tile>) => setTile({ ...tile, ...p });
  const done = (value: Tile) => {
    update((c) => ({ ...c, tile: value }));
    onComplete();
  };
  const save = () => {
    const errs = [];
    if (!tile.name.trim()) errs.push("Enter a Tile Name.");
    if (tile.live && tile.offline && tile.live > tile.offline)
      errs.push("Offline date must be after the live date.");
    if (tile.archive && (tile.offline || tile.live) > tile.archive)
      errs.push("Archive date must be after the tile dates.");
    setError(errs);
    if (!errs.length) done(tile);
  };
  if (mode === "choose")
    return (
      <Modal title="Select Option" onClose={onClose} width={512}>
        <div className="stack">
          <button
            type="button"
            className="tile-option new"
            onClick={() => setMode("create")}
          >
            <span>
              <Icon name="plus" size={24} />
            </span>
            <div>
              Create new tile<small>Add your club to a new tile</small>
            </div>
          </button>
          <button
            type="button"
            className="tile-option existing"
            onClick={() => setMode("existing")}
          >
            <span>
              <Icon name="swap" size={24} />
            </span>
            <div>
              Use existing Tile<small>Choose from an existing tile</small>
            </div>
          </button>
        </div>
      </Modal>
    );
  if (mode === "existing")
    return (
      <Modal
        title="Select Existing tile"
        width={546}
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={() => setMode("choose")}>
            Go back
          </Button>
        }
      >
        <div className="tile-grid">
          {[...demoClubs(), ...state.clubs].map((c, i) => (
            <button
              type="button"
              className="booking-tile"
              style={{
                backgroundImage: `url(${c.tile.image || "/assets/tile-photo.png"})`,
              }}
              key={`${c.id}-${i}`}
              onClick={() => done({ ...c.tile })}
            >
              <strong>{c.tile.name || c.name}</strong>
            </button>
          ))}
        </div>
      </Modal>
    );
  return (
    <Modal
      title="Create Booking Tile"
      width={529}
      onClose={onClose}
      className="tile-modal"
      footer={
        <>
          <Button variant="ghost" onClick={() => setMode("choose")}>
            Cancel
          </Button>
          <Button onClick={save}>Continue</Button>
        </>
      }
    >
      <Errors errors={error} />
      <div className="stack">
        <Field
          label="Tile Name"
          value={tile.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
        <div className="grid3">
          {(["live", "offline", "archive"] as const).map((k) => (
            <Field
              key={k}
              label={`${k[0].toUpperCase() + k.slice(1)} date`}
              type="date"
              value={tile[k]}
              onChange={(e) => patch({ [k]: e.target.value })}
            />
          ))}
        </div>
        <Field label="Tile Image" help="Recommended">
          <div className="upload-box">
            {tile.image && (
              <div className="upload-preview">
                <img alt="Uploaded tile" src={tile.image} />
                <IconButton
                  name="x"
                  label="Remove tile image"
                  onClick={() => patch({ image: "" })}
                />
              </div>
            )}
            <label className="upload-label">
              {tile.image ? "Replace image" : "Choose image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        file.type,
                      )
                    )
                      throw Error("Choose a PNG, JPEG or WebP image.");
                    patch({ image: await readUpload(file) });
                    setError([]);
                  } catch (err) {
                    setError([(err as Error).message]);
                  }
                }}
              />
            </label>
          </div>
        </Field>
        <Toggle
          label="Add Shadow"
          checked={tile.shadow}
          onChange={(shadow) => patch({ shadow })}
        />
        <div className="grid2">
          <Field
            label="Choose background colour"
            type="color"
            value={tile.background}
            onChange={(e) => patch({ background: e.target.value })}
          />
          <Field
            label="Choose text colour"
            type="color"
            value={tile.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </div>
        <span>Preview Tile</span>
        <div className="tile-preview-grid">
          <div
            className="booking-tile preview"
            style={{
              background: tile.background,
              color: tile.color,
              backgroundImage: tile.image ? `url(${tile.image})` : undefined,
              boxShadow: tile.shadow ? "0 4px 12px #0003" : undefined,
            }}
          >
            <strong>{tile.name || "Out of School Clubs"}</strong>
            <span className="preview-button">Book Now</span>
          </div>
          <div
            className="booking-tile preview"
            style={{
              background: tile.background,
              color: tile.color,
              backgroundImage: tile.image ? `url(${tile.image})` : undefined,
            }}
          >
            <strong>{tile.name || "Out of School Clubs"}</strong>
            <span className="preview-button">View Clubs</span>
            <span className="preview-button">Book Trial</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
