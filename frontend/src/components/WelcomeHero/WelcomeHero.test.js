import { screen } from '@testing-library/react';
import WelcomeHero from './WelcomeHero';
import { renderWithProviders } from '../../test-utils';

describe('WelcomeHero', () => {
  test('shows the main heading', () => {
    renderWithProviders(<WelcomeHero />, { isAuthorised: false });
    expect(screen.getByRole('heading', { level: 1, name: 'A quiet place for your thoughts' })).toBeInTheDocument();
  });

  test('links to sign up and sign in', () => {
    renderWithProviders(<WelcomeHero />, { isAuthorised: false });
    expect(screen.getByRole('link', { name: 'Start writing' })).toHaveAttribute('href', '/sign-up');
    expect(screen.getByRole('link', { name: 'I already have an account' })).toHaveAttribute('href', '/sign-in');
  });

  test('lists the three features', () => {
    renderWithProviders(<WelcomeHero />, { isAuthorised: false });
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual(['Organise by journal', 'Write freely', 'Private by default']);
  });
});
