import { Routes, Route } from "react-router"
import HomePage from "./HomePage/HomePage";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";
import { useState, useEffect, createContext } from "react";

export const AuthorisationContext = createContext()
export const JournalContext = createContext()
export const EntryContext = createContext()

function App() {
  let [isAuthorised, setIsAuthorised] = useState(false)
  let [journals, setJournals] = useState([])
  let [entries, setEntries] = useState([])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!(token == null)) {
          const response = await fetch("http://localhost:8080/get-user-info", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          })
          const payload = await response.json();
          if (!(payload.username == null)) {
            setIsAuthorised(true)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchUserInfo()
  })

  return (
    <AuthorisationContext.Provider value={{ isAuthorised, setIsAuthorised, journals, setJournals }}>
      <JournalContext.Provider value={{ journals, setJournals }}>
        <EntryContext.Provider value={{ entries, setEntries }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </EntryContext.Provider>
      </JournalContext.Provider>
    </AuthorisationContext.Provider>
  );
}

export default App;
