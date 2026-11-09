import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalsSidePanel from './JournalsSidePanel';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

const journals = [
  { id: 10, name: 'Travel' },
  { id: 20, name: 'Work' },
];

function renderPanel(options = {}) {
  localStorage.setItem('token', 'test-token');
  return renderWithProviders(<JournalsSidePanel />, { journals, ...options });
}

describe('JournalsSidePanel', () => {
  test('lists every journal with a count', () => {
    renderPanel();
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Travel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('shows an empty message when there are no journals', () => {
    renderPanel({ journals: [] });
    expect(screen.getByText(/No journals yet/)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('marks only the active journal', () => {
    renderPanel({ activeJournal: 20 });
    expect(screen.getByRole('button', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Travel' })).not.toHaveAttribute('aria-current');
  });

  test('creates a journal, clears the input and makes it active', async () => {
    global.fetch.mockResolvedValue(mockResponse({ journalId: 30, timestamp: 123 }));
    const { state } = renderPanel();
    const input = screen.getByRole('textbox', { name: 'New journal name' });

    userEvent.type(input, 'Dreams');
    userEvent.click(screen.getByRole('button', { name: 'Create journal' }));

    expect(await screen.findByRole('button', { name: 'Dreams' })).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(state.journals).toEqual([...journals, { id: 30, name: 'Dreams', timestamp: 123 }]);
    expect(state.activeJournal).toBe(30);
    expect(fetchCall()).toEqual({
      url: `${API_URL}/add-journal`,
      method: 'Post',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: { journalName: 'Dreams' },
    });
  });

  test('shows a warning for a blank name and hides it after a valid submit', async () => {
    global.fetch.mockResolvedValue(mockResponse({ journalId: 30, timestamp: 123 }));
    renderPanel();
    const input = screen.getByRole('textbox', { name: 'New journal name' });

    userEvent.type(input, '   ');
    userEvent.click(screen.getByRole('button', { name: 'Create journal' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please provide a journal name');
    expect(global.fetch).not.toHaveBeenCalled();

    userEvent.clear(input);
    userEvent.type(input, 'Dreams{enter}');

    expect(await screen.findByRole('button', { name: 'Dreams' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('highlights the create button only when a name is typed', () => {
    renderPanel();
    const button = screen.getByRole('button', { name: 'Create journal' });
    expect(button).not.toHaveClass('is-ready');

    userEvent.type(screen.getByRole('textbox', { name: 'New journal name' }), 'A');
    expect(button).toHaveClass('is-ready');
  });
});
