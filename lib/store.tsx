"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { AppState, Club } from "@/types";
import { loadState, newState, reconcile } from "./model";
const KEY = "ipal-create-club-v1";
type Store = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  update: (fn: (c: Club) => Club) => void;
  ready: boolean;
  storageError: string;
};
const Context = createContext<Store | null>(null);
export function Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(newState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      setState(loadState(localStorage.getItem(KEY)));
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes cannot be saved after refresh.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is full. Remove large uploads to save your changes.",
      );
    }
  }, [state, ready]);
  const update = (fn: (c: Club) => Club) =>
    setState((s) => ({ ...s, draft: reconcile(fn(s.draft)) }));
  return (
    <Context.Provider value={{ state, setState, update, ready, storageError }}>
      {children}
    </Context.Provider>
  );
}
export function useClub() {
  const c = useContext(Context);
  if (!c) throw Error("Missing club provider");
  return c;
}
