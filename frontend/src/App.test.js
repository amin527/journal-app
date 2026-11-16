import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import { mockResponse, fetchCall, API_URL } from './test-utils';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  test('shows the guest landing page and skips the user fetch without a token', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'A quiet place for your thoughts' })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('loads the user with the stored token and shows their journals', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch.mockResolvedValue(
      mockResponse({
        username: 'amin@example.com',
        journals: [{ id: 10, name: 'Travel' }],
        entries: [{ id: 1, journalId: 10, message: 'Hi', timestamp: Date.now() }],
      })
    );

    renderApp();

    expect(await screen.findByRole('button', { name: 'Travel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(fetchCall()).toMatchObject({
      url: `${API_URL}/get-user-info`,
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  test('stays on the guest page when the token is not accepted', async () => {
    localStorage.setItem('token', 'expired');
    global.fetch.mockResolvedValue(mockResponse({}));

    renderApp();

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('logs and survives a failed user fetch', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('token', 'test-token');
    global.fetch.mockRejectedValue(new Error('offline'));

    renderApp();

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'A quiet place for your thoughts' })).toBeInTheDocument();
  });

  test.each([
    ['/sign-in', 'Sign in'],
    ['/sign-up', 'Create an account'],
  ])('routes %s to its page', (route, heading) => {
    renderApp(route);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
