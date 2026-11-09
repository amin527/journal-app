import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalEntry from './JournalEntry';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

const entry = {
  id: 1,
  journalId: 10,
  message: 'First entry',
  timestamp: new Date(2025, 0, 15, 9, 5).getTime(),
};
const otherEntry = { id: 2, journalId: 10, message: 'Second entry', timestamp: entry.timestamp };

function renderEntry() {
  localStorage.setItem('token', 'test-token');
  return renderWithProviders(<JournalEntry item={entry} />, { entries: [entry, otherEntry] });
}

function openMenu() {
  userEvent.click(screen.getByRole('button', { name: 'Entry options' }));
}

describe('JournalEntry', () => {
  test('shows the message and a zero-padded time', () => {
    renderEntry();
    expect(screen.getByText('First entry')).toBeInTheDocument();
    expect(screen.getByText('09:05')).toHaveAttribute('dateTime', new Date(entry.timestamp).toISOString());
  });

  describe('options menu', () => {
    test('is hidden until the options button is clicked', () => {
      renderEntry();
      const button = screen.getByRole('button', { name: 'Entry options' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');

      userEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    test('closes when the options button is clicked again', () => {
      renderEntry();
      openMenu();
      openMenu();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('closes when clicking elsewhere on the page', () => {
      renderEntry();
      openMenu();
      userEvent.click(document.body);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    test('sends a delete request and removes the entry on success', async () => {
      global.fetch.mockResolvedValue(mockResponse({ message: 'deleted' }));
      const { state } = renderEntry();

      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

      await waitFor(() => expect(state.entries).toEqual([otherEntry]));
      expect(fetchCall()).toEqual({
        url: `${API_URL}/delete-entry`,
        method: 'Post',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: { id: 1 },
      });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('keeps the entry when the server rejects the delete', async () => {
      global.fetch.mockResolvedValue(mockResponse({ message: 'nope' }, 500));
      const { state } = renderEntry();

      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
      expect(state.entries).toEqual([entry, otherEntry]);
    });
  });

  describe('editing', () => {
    function startEditing() {
      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      return screen.getByRole('textbox', { name: 'Edit entry' });
    }

    test('swaps the message for a focused textarea holding the current text', () => {
      renderEntry();
      const textarea = startEditing();

      expect(textarea).toHaveValue('First entry');
      expect(textarea).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Entry options' })).not.toBeInTheDocument();
    });

    test('saves the new text with the Save button', async () => {
      global.fetch.mockResolvedValue(mockResponse({ message: 'edited' }));
      const { state } = renderEntry();
      const textarea = startEditing();

      userEvent.clear(textarea);
      userEvent.type(textarea, 'Updated entry');
      userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(state.entries[0].message).toBe('Updated entry'));
      expect(fetchCall()).toMatchObject({
        url: `${API_URL}/edit-entry`,
        body: { id: 1, newValue: 'Updated entry' },
      });
      expect(state.entries[1]).toEqual(otherEntry);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('saves with Enter', async () => {
      global.fetch.mockResolvedValue(mockResponse({}));
      const { state } = renderEntry();
      const textarea = startEditing();

      fireEvent.change(textarea, { target: { value: 'Via enter' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => expect(state.entries[0].message).toBe('Via enter'));
    });

    test('does not save on Shift + Enter', () => {
      renderEntry();
      const textarea = startEditing();

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(textarea).toBeInTheDocument();
    });

    test('does not save blank text', () => {
      renderEntry();
      const textarea = startEditing();

      fireEvent.change(textarea, { target: { value: '   ' } });
      userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(textarea).toBeInTheDocument();
    });

    test('leaves the entry unchanged when the server rejects the edit', async () => {
      global.fetch.mockResolvedValue(mockResponse({}, 500));
      const { state } = renderEntry();
      const textarea = startEditing();

      fireEvent.change(textarea, { target: { value: 'Rejected' } });
      userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
      expect(state.entries[0].message).toBe('First entry');
    });

    test.each([
      ['the Cancel button', () => userEvent.click(screen.getByRole('button', { name: 'Cancel' }))],
      ['Escape', () => fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })],
    ])('discards changes with %s', (_, cancel) => {
      renderEntry();
      const textarea = startEditing();
      fireEvent.change(textarea, { target: { value: 'Draft change' } });

      cancel();

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('First entry')).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();

      expect(startEditing()).toHaveValue('First entry');
    });
  });
});
