import { describe, expect, it } from 'vitest';
import en from '../i18n/locales/en.json';
import {
  KNOWN_COMPONENTS,
  KNOWN_REASONS,
  NETWORK_STATUS_NAMES,
  PROVIDER_TYPE_NAMES,
  ROLE_NAMES,
  isKnown,
  nameOf,
} from './governance';

describe('governance helpers', () => {
  it('names integer enum values and returns undefined for unknown ones', () => {
    expect(nameOf(ROLE_NAMES, 3)).toBe('Administrator');
    expect(nameOf(NETWORK_STATUS_NAMES, 2)).toBe('Disabled');
    expect(nameOf(ROLE_NAMES, 99)).toBeUndefined();
  });

  it('recognises known codes only', () => {
    expect(isKnown(KNOWN_REASONS, 'job_host_not_deployed')).toBe(true);
    expect(isKnown(KNOWN_REASONS, 'something_else')).toBe(false);
    expect(isKnown(KNOWN_REASONS, null)).toBe(false);
    expect(isKnown(KNOWN_REASONS, undefined)).toBe(false);
  });

  it('has a translation for every role, status, provider, reason and component', () => {
    for (const role of ROLE_NAMES) {
      expect(en.roles).toHaveProperty(role);
    }
    for (const status of NETWORK_STATUS_NAMES) {
      expect(en.networkStatus).toHaveProperty(status);
    }
    for (const provider of PROVIDER_TYPE_NAMES) {
      expect(en.providerType).toHaveProperty(provider);
    }
    for (const reason of KNOWN_REASONS) {
      expect(en.security.reasons).toHaveProperty(reason);
    }
    for (const component of KNOWN_COMPONENTS) {
      expect(en.security.health.components).toHaveProperty(component);
    }
  });
});
