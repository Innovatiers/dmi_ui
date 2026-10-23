import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { setIdentity } from '../src/auth/session';
import '../src/i18n';

afterEach(() => {
  cleanup();
  setIdentity(null);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
