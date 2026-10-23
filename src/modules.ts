/**
 * The fifteen CogniaWerks functional modules (FD v1.1). Each module gets a route and a navigation entry;
 * labels are i18n keys under `modules.<id>`.
 */
export interface ModuleDefinition {
  /** Module identifier, e.g. `M01`. */
  readonly id: string;
  /** URL path segment. */
  readonly slug: string;
}

/** The administration module; listed only for a role that may open one of its screens. */
export const ADMINISTRATION_MODULE = 'M14';

export const MODULES: readonly ModuleDefinition[] = [
  { id: 'M01', slug: 'integration-hub' },
  { id: 'M02', slug: 'assets' },
  { id: 'M03', slug: 'data-explorer' },
  { id: 'M04', slug: 'dashboards' },
  { id: 'M05', slug: 'alerts' },
  { id: 'M06', slug: 'performance' },
  { id: 'M07', slug: 'anomalies' },
  { id: 'M08', slug: 'diagnostics' },
  { id: 'M09', slug: 'forecasts' },
  { id: 'M10', slug: 'assistant' },
  { id: 'M11', slug: 'decisions' },
  { id: 'M12', slug: 'actions' },
  { id: 'M13', slug: 'optimization' },
  { id: 'M14', slug: 'administration' },
  { id: 'M15', slug: 'reports' },
];
