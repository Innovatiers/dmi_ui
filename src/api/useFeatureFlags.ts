import { useCallback, useEffect, useState } from 'react';
import { apiClient, type ApiClient } from './client';
import type { components } from './generated/schema';

/** A feature flag as reported by `GET /api/v1/features`. */
export type FeatureFlag = components['schemas']['FeatureFlagDto'];

/** Names of the feature flags the UI knows about. */
export const FEATURE_FLAGS = {
  anyLogLiveRest: 'AnyLogLiveRest',
  dashboardStudio: 'DashboardStudio',
  alertNotifications: 'AlertNotifications',
} as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export interface FeatureFlagsState {
  readonly status: 'loading' | 'ready' | 'error';
  readonly flags: readonly FeatureFlag[];
  readonly error: unknown;
  /** Whether a flag is on for the current tenant; always `false` while loading or after an error (fail closed). */
  readonly isEnabled: (name: FeatureFlagName) => boolean;
}

type LoadState = Omit<FeatureFlagsState, 'isEnabled'>;

const INITIAL_STATE: LoadState = { status: 'loading', flags: [], error: undefined };

/**
 * Loads the feature flags of the current tenant once. Pass a stable client (the default shared client is);
 * a new client instance on every render would refetch.
 */
export function useFeatureFlags(client: Pick<ApiClient, 'get'> = apiClient): FeatureFlagsState {
  const [state, setState] = useState<LoadState>(INITIAL_STATE);

  useEffect(() => {
    const controller = new AbortController();
    void client.get('/api/v1/features', { signal: controller.signal }).then(
      (response) => {
        setState({ status: 'ready', flags: response.items, error: undefined });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', flags: [], error });
        }
      },
    );
    return () => {
      controller.abort();
    };
  }, [client]);

  const isEnabled = useCallback(
    (name: FeatureFlagName) =>
      state.status === 'ready' && state.flags.some((flag) => flag.name === name && flag.enabled),
    [state],
  );

  return { ...state, isEnabled };
}
