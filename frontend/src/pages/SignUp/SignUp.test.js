import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router';
import SignUp from './SignUp';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

function renderSignUp() {
  return renderWithProviders(
    <Routes>
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/" element={<p>Home page</p>} />
    </Routes>,
    { isAuthorised: false, route: '/sign-up' }
  );
}

function fillAndSubmit() {
  userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
  userEvent.type(screen.getByLabelText('Password'), 'secret123');
  userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('SignUp', () => {
  test('renders the form and a link to sign in', () => {
    renderSignUp();
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toHaveAttribute('autoComplete', 'new-password');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });

  test('on success, stores the token, signs the user in and goes home', async () => {
    global.fetch.mockResolvedValue(mockResponse({ token: 'jwt-new' }));
    const { state } = renderSignUp();

    fillAndSubmit();

    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('jwt-new');
    expect(state.isAuthorised).toBe(true);
    expect(fetchCall()).toEqual({
      url: `${API_URL}/auth/register`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'new@example.com', password: 'secret123' },
    });
  });

  test('disables the button while the request is in flight', async () => {
    let resolve;
    global.fetch.mockReturnValue(new Promise((r) => { resolve = r; }));
    renderSignUp();

    fillAndSubmit();

    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();

    resolve(mockResponse({ token: 'jwt-new' }));
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  test('shows an error and stays on the page when registration fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValue(mockResponse({}, 409));
    const { state } = renderSignUp();

    fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't create your account");
    expect(localStorage.getItem('token')).toBeNull();
    expect(state.isAuthorised).toBe(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled());
  });
});
