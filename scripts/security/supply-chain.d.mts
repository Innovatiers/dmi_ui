/** Types for supply-chain.mjs (supply-chain gate logic). */

export interface VulnerabilityException {
  id: string;
  reason: string;
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

export const PERMISSIVE: ReadonlySet<string>;
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
export function unacknowledged(packages: LockfilePackage[], licenceDocument: string): LockfilePackage[];
export function licenceReport(packages: LockfilePackage[]): string;
