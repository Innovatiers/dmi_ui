import axe from 'axe-core';

/**
 * Runs axe-core against a rendered container and returns serious/critical violations.
 * Colour contrast cannot be computed in jsdom; it is covered by the Playwright axe check.
 */
export async function seriousViolations(container: Element): Promise<axe.Result[]> {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
}
