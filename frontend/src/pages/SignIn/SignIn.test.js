import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router';
import SignIn from './SignIn';
import { renderWithProviders, mockResponse, fetchCall, API_URL } from '../../test-utils';

function renderSignIn() {
  return renderWithProviders(
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/" element={<p>Home page</p>} />
    </Routes>,
    { isAuthorised: false, route: '/sign-in' }
  );
}

function fillAndSubmit() {
  userEvent.type(screen.getByLabelText('Email'), 'amin@example.com');
  userEvent.type(screen.getByLabelText('Password'), 'secret123');
  userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('SignIn', () => {
  test('renders the form and a link to sign up', () => {
    renderSignIn();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/sign-up');
  });

  test('on success, stores the token, signs the user in and goes home', async () => {
    global.fetch.mockResolvedValue(mockResponse({ token: 'jwt-123' }));
    const { state } = renderSignIn();

    fillAndSubmit();

    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('jwt-123');
    expect(state.isAuthorised).toBe(true);
    expect(fetchCall()).toEqual({
      url: `${API_URL}/auth/authenticate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'amin@example.com', password: 'secret123' },
    });
  });

  test('disables the button while the request is in flight', async () => {
    let resolve;
    global.fetch.mockReturnValue(new Promise((r) => { resolve = r; }));
    renderSignIn();

    fillAndSubmit();

    const button = screen.getByRole('button', { name: 'Signing in…' });
    expect(button).toBeDisabled();

    resolve(mockResponse({ token: 'jwt-123' }));
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  test('shows an error and stays on the page when the credentials are wrong', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValue(mockResponse({}, 403));
    const { state } = renderSignIn();

    fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password');
    expect(localStorage.getItem('token')).toBeNull();
    expect(state.isAuthorised).toBe(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled());
  });

  test('shows an error when the network request fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error('offline'));
    renderSignIn();

    fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password');
  });
});
