import { screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalPane from './JournalPane';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

const journals = [
  { id: 10, name: 'Travel' },
  { id: 20, name: 'Work' },
];

function daysAgo(days, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

const olderDate = new Date(2020, 2, 3, 8, 30);

function renderPane({ activeJournal = 10, entries = [] } = {}) {
  localStorage.setItem('token', 'test-token');
  return renderWithProviders(<JournalPane />, { journals, entries, activeJournal });
}

describe('JournalPane', () => {
  test('prompts the user to pick a journal when none is active', () => {
    renderPane({ activeJournal: -1 });
    expect(screen.getByRole('heading', { name: 'Pick a journal' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'New entry' })).not.toBeInTheDocument();
  });

  test('shows an empty state for a journal with no entries', () => {
    renderPane({ entries: [{ id: 1, journalId: 20, message: 'Elsewhere', timestamp: daysAgo(0) }] });
    expect(screen.getByRole('heading', { name: 'Travel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A blank page' })).toBeInTheDocument();
    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });

  test('lists only the entries of the active journal', () => {
    renderPane({
      entries: [
        { id: 1, journalId: 10, message: 'In Travel', timestamp: daysAgo(0) },
        { id: 2, journalId: 20, message: 'In Work', timestamp: daysAgo(0) },
      ],
    });
    expect(screen.getByText('In Travel')).toBeInTheDocument();
    expect(screen.queryByText('In Work')).not.toBeInTheDocument();
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  test('groups entries under Today, Yesterday and full-date dividers', () => {
    renderPane({
      entries: [
        { id: 1, journalId: 10, message: 'Old', timestamp: olderDate.getTime() },
        { id: 2, journalId: 10, message: 'Yesterday 1', timestamp: daysAgo(1, 9) },
        { id: 3, journalId: 10, message: 'Yesterday 2', timestamp: daysAgo(1, 10) },
        { id: 4, journalId: 10, message: 'Today', timestamp: daysAgo(0) },
      ],
    });

    const dividers = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    const expectedOld = olderDate.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    expect(dividers).toEqual([expectedOld, 'Yesterday', 'Today']);
    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });

  describe('composer', () => {
    test('adds an entry with the send button and clears the draft', async () => {
      global.fetch.mockResolvedValue(mockResponse({ id: 99, timestamp: daysAgo(0) }));
      const { state } = renderPane();
      const textarea = screen.getByRole('textbox', { name: 'New entry' });

      userEvent.type(textarea, 'Hello journal');
      userEvent.click(screen.getByRole('button', { name: 'Save entry' }));

      const list = await screen.findByRole('list');
      expect(within(list).getByText('Hello journal')).toBeInTheDocument();
      expect(textarea).toHaveValue('');
      expect(state.entries).toEqual([
        { id: 99, journalId: 10, timestamp: expect.any(Number), message: 'Hello journal' },
      ]);
      expect(fetchCall()).toEqual({
        url: `${API_URL}/add-entry`,
        method: 'Post',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: { message: 'Hello journal', journalId: 10 },
      });
    });

    test('adds an entry with Enter', async () => {
      global.fetch.mockResolvedValue(mockResponse({ id: 5, timestamp: daysAgo(0) }));
      renderPane();
      const textarea = screen.getByRole('textbox', { name: 'New entry' });

      fireEvent.change(textarea, { target: { value: 'Quick note' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      const list = await screen.findByRole('list');
      expect(within(list).getByText('Quick note')).toBeInTheDocument();
    });

    test('does not submit on Shift + Enter', () => {
      renderPane();
      const textarea = screen.getByRole('textbox', { name: 'New entry' });

      fireEvent.change(textarea, { target: { value: 'Multi-line' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('ignores blank drafts', () => {
      renderPane();
      fireEvent.change(screen.getByRole('textbox', { name: 'New entry' }), { target: { value: '   ' } });
      userEvent.click(screen.getByRole('button', { name: 'Save entry' }));
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('highlights the send button only when there is text to save', () => {
      renderPane();
      const button = screen.getByRole('button', { name: 'Save entry' });
      expect(button).not.toHaveClass('is-ready');

      userEvent.type(screen.getByRole('textbox', { name: 'New entry' }), 'x');
      expect(button).toHaveClass('is-ready');
    });
  });
});
