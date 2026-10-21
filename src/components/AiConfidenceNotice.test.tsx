import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AiConfidenceNotice } from './AiConfidenceNotice';

describe('AiConfidenceNotice', () => {
  it('renders nothing at or above the threshold', () => {
    const { container } = render(<AiConfidenceNotice confidence={0.6} />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each([0.59, 0, Number.NaN])('warns when confidence is %s', (confidence) => {
    render(<AiConfidenceNotice confidence={confidence} />);

    expect(screen.getByRole('status')).toHaveTextContent('Low confidence');
  });
});
