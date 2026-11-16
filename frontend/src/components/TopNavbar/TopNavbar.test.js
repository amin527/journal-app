import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopNavbar from './TopNavbar';
import { renderWithProviders } from '../../test-utils';

describe('TopNavbar', () => {
  test('on the home page, a signed-in user sees the brand and a log out button', () => {
    renderWithProviders(<TopNavbar location="home" />, { isAuthorised: true });
    expect(screen.getByText('My Diary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
  });

  test('logging out clears the token and the signed-in state', () => {
    localStorage.setItem('token', 'test-token');
    const { state } = renderWithProviders(<TopNavbar location="home" />, { isAuthorised: true });

    userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(state.isAuthorised).toBe(false);
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('on the home page, a guest sees a Sign In link', () => {
    renderWithProviders(<TopNavbar location="home" />, { isAuthorised: false });
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/sign-in');
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  test('on the auth pages, shows a Home link', () => {
    renderWithProviders(<TopNavbar location="sign-in" />, { isAuthorised: false });
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('My Diary')).toBeInTheDocument();
  });
});
