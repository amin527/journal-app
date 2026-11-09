import { useState } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthorisationContext, JournalsContext, EntriesContext } from './App';
import { ActiveJournalContext } from './pages/Landing/Landing';

export const API_URL = 'http://api.test';

export function renderWithProviders(
  ui,
  { isAuthorised = true, journals = [], entries = [], activeJournal = -1, route = '/' } = {}
) {
  const state = {};

  function Providers({ children }) {
    const [auth, setAuth] = useState(isAuthorised);
    const [journalList, setJournalList] = useState(journals);
    const [entryList, setEntryList] = useState(entries);
    const [active, setActive] = useState(activeJournal);

    Object.assign(state, {
      isAuthorised: auth,
      journals: journalList,
      entries: entryList,
      activeJournal: active,
    });

    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthorisationContext.Provider
          value={{ isAuthorised: auth, setIsAuthorised: setAuth, journals: journalList, setJournals: setJournalList }}
        >
          <JournalsContext.Provider value={{ journals: journalList, setJournals: setJournalList }}>
            <EntriesContext.Provider value={{ entries: entryList, setEntries: setEntryList }}>
              <ActiveJournalContext.Provider value={{ activeJournal: active, setActiveJournal: setActive }}>
                {children}
              </ActiveJournalContext.Provider>
            </EntriesContext.Provider>
          </JournalsContext.Provider>
        </AuthorisationContext.Provider>
      </MemoryRouter>
    );
  }

  return { ...render(ui, { wrapper: Providers }), state };
}

export function mockResponse(body = {}, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

export function fetchCall(index = 0) {
  const [url, options = {}] = global.fetch.mock.calls[index];
  return {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.parse(options.body) : undefined,
  };
}
