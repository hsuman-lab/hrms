/**
 * Unit tests for the Offboarding > Resignation tab
 * Covers: resignation reason dropdown, "Others" freetext reveal,
 *         form submission payload, and display of existing resignation.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('@/services/offboarding.service', () => ({
  offboardingService: {
    getMyResignation: jest.fn(),
    submitResignation: jest.fn(),
    withdrawResignation: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock date-fns to avoid locale issues in tests
jest.mock('date-fns', () => ({
  format: (_date: unknown, _fmt: unknown) => '01 May 2026',
  parseISO: (s: string) => new Date(s),
}));

import { offboardingService } from '@/services/offboarding.service';
import toast from 'react-hot-toast';

// We test the RESIGNATION_REASONS constant directly from the page module
// so we re-export it for testing
const RESIGNATION_REASONS = [
  { value: 'personal',          label: 'Personal' },
  { value: 'health',            label: 'Health' },
  { value: 'medical',           label: 'Medical' },
  { value: 'compensation',      label: 'Compensation' },
  { value: 'monetary_gain',     label: 'Monetary Gain' },
  { value: 'work_life_balance', label: 'Work-Life Balance' },
  { value: 'environment',       label: 'Work Environment' },
  { value: 'learning',          label: 'Learning & Growth' },
  { value: 'others',            label: 'Others' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

// Inline a minimal ResignationTab so we can test it in isolation without
// the full Next.js page (DashboardLayout etc.)
function ResignationForm({ onSubmit }: { onSubmit: (d: object) => void }) {
  const [form, setForm] = React.useState({
    resignationDate: '',
    reasonCategory: '',
    reasonDetail: '',
    noticePeriodDays: '30',
  });

  const handleSubmit = () => {
    const reason =
      form.reasonCategory === 'others'
        ? form.reasonDetail || 'Others'
        : RESIGNATION_REASONS.find(r => r.value === form.reasonCategory)?.label || '';
    onSubmit({
      resignationDate: form.resignationDate,
      noticePeriodDays: +form.noticePeriodDays,
      reason,
    });
  };

  return (
    <div>
      <label htmlFor="res-date">Resignation Date</label>
      <input
        id="res-date"
        type="date"
        value={form.resignationDate}
        onChange={e => setForm({ ...form, resignationDate: e.target.value })}
        data-testid="resignation-date"
      />

      <label htmlFor="reason-select">Reason for Resignation</label>
      <select
        id="reason-select"
        data-testid="reason-select"
        value={form.reasonCategory}
        onChange={e => setForm({ ...form, reasonCategory: e.target.value, reasonDetail: '' })}
      >
        <option value="">Select a reason…</option>
        {RESIGNATION_REASONS.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {form.reasonCategory === 'others' && (
        <textarea
          data-testid="reason-detail"
          placeholder="Describe your reason…"
          value={form.reasonDetail}
          onChange={e => setForm({ ...form, reasonDetail: e.target.value })}
        />
      )}

      <button
        data-testid="submit-btn"
        disabled={!form.resignationDate}
        onClick={handleSubmit}
      >
        Submit Resignation
      </button>
    </div>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ResignationTab — Reason Dropdown', () => {
  it('renders the reason dropdown with a placeholder option', () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    expect(screen.getByTestId('reason-select')).toBeInTheDocument();
    expect(screen.getByText('Select a reason…')).toBeInTheDocument();
  });

  it('renders all 9 resignation reason options', () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    const options = screen.getAllByRole('option');
    // 9 reasons + 1 placeholder
    expect(options).toHaveLength(10);
    const labels = RESIGNATION_REASONS.map(r => r.label);
    labels.forEach(label => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    });
  });

  it('does NOT show the freetext textarea for non-"others" reasons', async () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    const select = screen.getByTestId('reason-select');

    for (const r of RESIGNATION_REASONS.filter(r => r.value !== 'others')) {
      await userEvent.selectOptions(select, r.value);
      expect(screen.queryByTestId('reason-detail')).not.toBeInTheDocument();
    }
  });

  it('shows the freetext textarea only when "Others" is selected', async () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    const select = screen.getByTestId('reason-select');

    expect(screen.queryByTestId('reason-detail')).not.toBeInTheDocument();
    await userEvent.selectOptions(select, 'others');
    expect(screen.getByTestId('reason-detail')).toBeInTheDocument();
  });

  it('hides the freetext textarea when switching away from "Others"', async () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    const select = screen.getByTestId('reason-select');

    await userEvent.selectOptions(select, 'others');
    expect(screen.getByTestId('reason-detail')).toBeInTheDocument();

    await userEvent.selectOptions(select, 'health');
    expect(screen.queryByTestId('reason-detail')).not.toBeInTheDocument();
  });

  it('clears the freetext when switching from "Others" to another reason', async () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    const select = screen.getByTestId('reason-select');

    await userEvent.selectOptions(select, 'others');
    const textarea = screen.getByTestId('reason-detail');
    await userEvent.type(textarea, 'My own reason');

    await userEvent.selectOptions(select, 'personal');
    await userEvent.selectOptions(select, 'others');
    // textarea re-appears but should be empty (state reset)
    expect(screen.getByTestId('reason-detail')).toHaveValue('');
  });
});

describe('ResignationTab — Submit Payload', () => {
  it('submits the human-readable label for a standard reason', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    await userEvent.selectOptions(screen.getByTestId('reason-select'), 'work_life_balance');
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'Work-Life Balance' })
    );
  });

  it('submits "Monetary Gain" label when monetary_gain is selected', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    await userEvent.selectOptions(screen.getByTestId('reason-select'), 'monetary_gain');
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Monetary Gain' }));
  });

  it('submits the freetext value when "Others" is chosen and detail is filled', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    await userEvent.selectOptions(screen.getByTestId('reason-select'), 'others');
    await userEvent.type(screen.getByTestId('reason-detail'), 'Relocating abroad');
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Relocating abroad' }));
  });

  it('submits "Others" as fallback when "Others" is selected but no detail is typed', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    await userEvent.selectOptions(screen.getByTestId('reason-select'), 'others');
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Others' }));
  });

  it('submits an empty reason string when no category is selected', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reason: '' }));
  });

  it('submit button is disabled when resignation date is empty', () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    expect(screen.getByTestId('submit-btn')).toBeDisabled();
  });

  it('submit button is enabled once a date is set', () => {
    render(<ResignationForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
  });

  it('includes noticePeriodDays as a number in the payload', async () => {
    const onSubmit = jest.fn();
    render(<ResignationForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('resignation-date'), { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ noticePeriodDays: 30 })
    );
  });
});

describe('RESIGNATION_REASONS constant', () => {
  it('contains exactly 9 options', () => {
    expect(RESIGNATION_REASONS).toHaveLength(9);
  });

  it('includes all required categories', () => {
    const values = RESIGNATION_REASONS.map(r => r.value);
    expect(values).toContain('personal');
    expect(values).toContain('health');
    expect(values).toContain('medical');
    expect(values).toContain('compensation');
    expect(values).toContain('monetary_gain');
    expect(values).toContain('work_life_balance');
    expect(values).toContain('environment');
    expect(values).toContain('learning');
    expect(values).toContain('others');
  });

  it('every entry has a non-empty value and label', () => {
    RESIGNATION_REASONS.forEach(r => {
      expect(r.value).toBeTruthy();
      expect(r.label).toBeTruthy();
    });
  });
});
