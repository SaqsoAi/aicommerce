"use client";

import { useEffect } from "react";

type ScrollSnapshot = {
  bodyOverflow: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
};

type ScrollLockState = {
  owners: Set<string>;
  snapshot: ScrollSnapshot | null;
  lifecycleBound: boolean;
};

declare global {
  interface Window {
    __saqsoScrollLockState?: ScrollLockState;
  }
}

function getState(): ScrollLockState {
  if (typeof window === "undefined") {
    return { owners: new Set<string>(), snapshot: null, lifecycleBound: false };
  }
  window.__saqsoScrollLockState ??= {
    owners: new Set<string>(),
    snapshot: null,
    lifecycleBound: false,
  };

  const state = window.__saqsoScrollLockState;
  if (!state.lifecycleBound) {
    const releaseAll = () => forceUnlockScroll();
    window.addEventListener("pagehide", releaseAll);
    window.addEventListener("beforeunload", releaseAll);
    state.lifecycleBound = true;
  }
  return state;
}

function applyLockedState(): void {
  const body = document.body;
  const html = document.documentElement;

  body.style.setProperty("overflow", "hidden");
  html.style.setProperty("overflow", "hidden");
  html.dataset.saqsoScrollLocked = "true";
}

function restoreUnlockedState(state: ScrollLockState): void {
  const body = document.body;
  const html = document.documentElement;
  const snapshot = state.snapshot;

  if (snapshot?.bodyOverflow) body.style.overflow = snapshot.bodyOverflow;
  else body.style.removeProperty("overflow");

  if (snapshot?.htmlOverflow) html.style.overflow = snapshot.htmlOverflow;
  else html.style.removeProperty("overflow");

  if (snapshot?.bodyPaddingRight) body.style.paddingRight = snapshot.bodyPaddingRight;
  else body.style.removeProperty("padding-right");

  delete html.dataset.saqsoScrollLocked;
  state.snapshot = null;
}

export function lockScroll(owner: string): void {
  if (typeof window === "undefined" || !owner) return;
  const state = getState();

  if (state.owners.size === 0) {
    state.snapshot = {
      bodyOverflow: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow,
    };
  }

  state.owners.add(owner);
  applyLockedState();
}

export function unlockScroll(owner: string): void {
  if (typeof window === "undefined" || !owner) return;
  const state = getState();
  state.owners.delete(owner);
  if (state.owners.size === 0) restoreUnlockedState(state);
}

export function forceUnlockScroll(): void {
  if (typeof window === "undefined") return;
  const state = getState();
  state.owners.clear();
  restoreUnlockedState(state);
}

export function useScrollLock(active: boolean, owner: string): void {
  useEffect(() => {
    if (!active) {
      unlockScroll(owner);
      return;
    }

    lockScroll(owner);
    return () => unlockScroll(owner);
  }, [active, owner]);
}


export function getScrollLockOwners(): string[] {
  if (typeof window === "undefined") return [];
  return Array.from(getState().owners);
}

export function isScrollLocked(): boolean {
  if (typeof window === "undefined") return false;
  return getState().owners.size > 0;
}
