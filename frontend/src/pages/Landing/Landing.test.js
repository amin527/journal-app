import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Landing from './Landing';
import { renderWithProviders } from '../../test-utils';

const journals = [
  { id: 10, name: 'Travel' },
  { id: 20, name: 'Work' },
];
const entries = [
  { id: 1, journalId: 10, message: 'Packed my bags', timestamp: Date.now() },
  { id: 2, journalId: 20, message: 'Stand-up notes', timestamp: Date.now() },
];

describe('Landing', () => {
  test('shows the welcome hero to guests', () => {
    renderWithProviders(<Landing />, { isAuthorised: false });
    expect(screen.getByRole('heading', { name: 'A quiet place for your thoughts' })).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Journals' })).not.toBeInTheDocument();
  });

  test('shows the journals panel and an unselected pane to signed-in users', () => {
    renderWithProviders(<Landing />, { isAuthorised: true, journals, entries });
    expect(screen.getByRole('complementary', { name: 'Journals' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pick a journal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'A quiet place for your thoughts' })).not.toBeInTheDocument();
  });

  test('selecting a journal in the panel opens its entries in the pane', () => {
    renderWithProviders(<Landing />, { isAuthorised: true, journals, entries });

    userEvent.click(screen.getByRole('button', { name: 'Work' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Work' })).toBeInTheDocument();
    expect(screen.getByText('Stand-up notes')).toBeInTheDocument();
    expect(screen.queryByText('Packed my bags')).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Travel' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Travel' })).toBeInTheDocument();
    expect(screen.getByText('Packed my bags')).toBeInTheDocument();
  });
});
