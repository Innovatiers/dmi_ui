/** Types for supply-chain.mjs (supply-chain gate logic). */

export interface VulnerabilityException {
  id: string;
  reason: string;
  /** Day the exception was added, YYYY-MM-DD (UTC); at most MAX_LIFETIME_DAYS before `expires`. */
  start: string;
  /** Last valid day, YYYY-MM-DD (UTC). */
  expires: string;
  package: string | undefined;
}

export interface AuditFinding {
  severity: string;
  package: string;
  advisory: string;
  title: string;
}

export type LicenceCategory = 'permissive' | 'copyleft' | 'review';

export interface LockfilePackage {
  name: string;
  version: string;
  scope: 'runtime' | 'dev';
  licence: string;
  category: LicenceCategory;
}

export type AcknowledgementScope = 'shipped' | 'test' | 'service';

export interface LicenceAcknowledgement {
  name: string;
  scope: AcknowledgementScope;
  licence: string;
}

export const PERMISSIVE: ReadonlySet<string>;
export const MAX_LIFETIME_DAYS: number;
export const SCOPES: readonly AcknowledgementScope[];
export class ExceptionsError extends Error {}
export function parseExceptions(text: string): Map<string, string>[];
export function todayUtc(): string;
export function loadExceptions(text: string, today?: string): VulnerabilityException[];
export function covers(exception: VulnerabilityException, advisoryId: string, pkg: string | undefined): boolean;
export function trivyIgnore(exceptions: VulnerabilityException[]): string;
export function npmFindings(report: unknown): AuditFinding[];
export function gate(
  findings: AuditFinding[],
  exceptions: VulnerabilityException[],
): { lines: string[]; blocking: string[] };
export function classifyLicence(expression: string | undefined): LicenceCategory;
export function lockfileInventory(lock: { packages?: Record<string, object> }): LockfilePackage[];
export function licenceAcknowledgements(licenceDocument: string): {
  acknowledgements: LicenceAcknowledgement[];
  errors: string[];
};
export function licenceViolations(packages: LockfilePackage[], licenceDocument: string): string[];
export function licenceReport(packages: LockfilePackage[]): string;
