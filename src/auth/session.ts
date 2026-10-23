import { useSyncExternalStore } from 'react';
import { findDevUser } from './devUsers';
import { rolesHavePermission, type Permission, type RoleName } from './permissions';

/** The signed-in user as far as the UI knows it: subject and roles. */
export interface Identity {
  readonly subject: string;
  readonly roles: readonly RoleName[];
}

/** Request header of the API's development-only authentication handler (story 03, DEC-04 interim). */
export const DEV_USER_HEADER = 'X-Dev-User';

const STORAGE_KEY = 'cogniawerks.devUser';

const listeners = new Set<() => void>();
let current: Identity | null = null;

function readStoredSubject(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSubject(subject: string | null): void {
  try {
    if (subject === null) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, subject);
    }
  } catch {
    // Storage can be unavailable (private window, blocked site data); the choice then lasts until a reload.
  }
}

if (import.meta.env.DEV) {
  current = findDevUser(readStoredSubject()) ?? null;
}

/** The current identity; always `null` in a production build until the sign-in flow exists (DEC-04). */
export function currentIdentity(): Identity | null {
  return current;
}

/** Sets the current identity (development role switcher); `null` signs out. */
export function setIdentity(identity: Identity | null): void {
  current = identity;
  storeSubject(identity?.subject ?? null);
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The current identity, re-rendering when it changes. */
export function useIdentity(): Identity | null {
  return useSyncExternalStore(subscribe, currentIdentity, currentIdentity);
}

/** Whether the identity holds the permission; no identity means no permission (fail closed). */
export function hasPermission(identity: Identity | null, permission: Permission): boolean {
  return identity !== null && rolesHavePermission(identity.roles, permission);
}

/** Headers that identify the caller: the development user in a development build, nothing otherwise. */
export function identityHeaders(): Readonly<Record<string, string>> {
  return import.meta.env.DEV && current ? { [DEV_USER_HEADER]: current.subject } : {};
}
