import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalTitle from './JournalTitle';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

const journals = [
  { id: 10, name: 'Travel' },
  { id: 20, name: 'Work' },
];
const entries = [
  { id: 1, journalId: 10, message: 'Travel entry', timestamp: 0 },
  { id: 2, journalId: 20, message: 'Work entry', timestamp: 0 },
];

function renderTitle({ journalIsActive = false } = {}) {
  localStorage.setItem('token', 'test-token');
  return renderWithProviders(
    <ul>
      <JournalTitle journalId={10} journalName="Travel" journalIsActive={journalIsActive} />
    </ul>,
    { journals, entries }
  );
}

function openMenu() {
  userEvent.click(screen.getByRole('button', { name: 'Options for Travel' }));
}

describe('JournalTitle', () => {
  test('selects the journal when clicked', () => {
    const { state } = renderTitle();
    userEvent.click(screen.getByRole('button', { name: 'Travel' }));
    expect(state.activeJournal).toBe(10);
  });

  test('marks the active journal', () => {
    renderTitle({ journalIsActive: true });
    expect(screen.getByRole('button', { name: 'Travel' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('listitem')).toHaveClass('active');
  });

  test('does not mark an inactive journal', () => {
    renderTitle();
    expect(screen.getByRole('button', { name: 'Travel' })).not.toHaveAttribute('aria-current');
  });

  describe('options menu', () => {
    test('opens from the options button and closes on a second click', () => {
      renderTitle();
      const button = screen.getByRole('button', { name: 'Options for Travel' });

      userEvent.click(button);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');

      userEvent.click(button);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('opens on right-click', () => {
      renderTitle();
      fireEvent.contextMenu(screen.getByRole('listitem'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    test('closes when clicking elsewhere', () => {
      renderTitle();
      openMenu();
      userEvent.click(document.body);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    test('asks for confirmation, then removes the journal and its entries', async () => {
      const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse({ message: 'deleted' }));
      const { state } = renderTitle();

      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('"Travel"'));
      await waitFor(() => expect(state.journals).toEqual([journals[1]]));
      expect(state.entries).toEqual([entries[1]]);
      expect(fetchCall()).toEqual({
        url: `${API_URL}/delete-journal`,
        method: 'Post',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: { id: 10 },
      });
    });

    test('does nothing when the user cancels the confirmation', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      const { state } = renderTitle();

      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(state.journals).toEqual(journals);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('keeps the journal when the server rejects the delete', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse({}, 500));
      const { state } = renderTitle();

      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
      expect(state.journals).toEqual(journals);
      expect(state.entries).toEqual(entries);
    });
  });

  describe('renaming', () => {
    function startRenaming() {
      openMenu();
      userEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
      return screen.getByRole('textbox', { name: 'Journal name' });
    }

    test('shows a focused input holding the current name', () => {
      renderTitle();
      const input = startRenaming();
      expect(input).toHaveValue('Travel');
      expect(input).toHaveFocus();
    });

    test('saves the new name', async () => {
      global.fetch.mockResolvedValue(mockResponse({ message: 'edited' }));
      const { state } = renderTitle();
      const input = startRenaming();

      userEvent.clear(input);
      userEvent.type(input, 'Holidays{enter}');

      await waitFor(() => expect(state.journals[0]).toEqual({ id: 10, name: 'Holidays' }));
      expect(state.journals[1]).toEqual(journals[1]);
      expect(fetchCall()).toMatchObject({
        url: `${API_URL}/edit-journal`,
        body: { id: 10, newValue: 'Holidays' },
      });
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('does not save a blank name', () => {
      renderTitle();
      const input = startRenaming();

      fireEvent.change(input, { target: { value: '  ' } });
      userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(input).toBeInTheDocument();
    });

    test.each([
      ['the Cancel button', () => userEvent.click(screen.getByRole('button', { name: 'Cancel' }))],
      ['Escape', () => fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })],
    ])('discards changes with %s', (_, cancel) => {
      renderTitle();
      fireEvent.change(startRenaming(), { target: { value: 'Draft' } });

      cancel();

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Travel' })).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(startRenaming()).toHaveValue('Travel');
    });
  });
});
