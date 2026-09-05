import { Routes, Route } from "react-router"
import "./App.css"
import Landing from "./pages/Landing/Landing";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import { useState, useEffect, createContext } from "react";

export const AuthorisationContext = createContext()
export const JournalsContext = createContext()
export const EntriesContext = createContext()

function App() {
  let [isAuthorised, setIsAuthorised] = useState(false)
  let [journals, setJournals] = useState([])
  let [entries, setEntries] = useState([])
  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!(token == null)) {
          const response = await fetch(`${API_URL}/get-user-info`, {
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
          if(!(payload.journals == null)){
            setJournals(payload.journals)
          }
          if(!(payload.entries == null)){
            setEntries(payload.entries.sort((a, b) => a - b))
          }
          console.log(payload)
        }
      } catch (error) {
        console.error(error)
      }   
    }
    fetchUserInfo()
  }, [isAuthorised, API_URL])

  return (
    <AuthorisationContext.Provider value={{ isAuthorised, setIsAuthorised, journals, setJournals }}>
      <JournalsContext.Provider value={{ journals, setJournals }}>
        <EntriesContext.Provider value={{ entries, setEntries }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </EntriesContext.Provider>
      </JournalsContext.Provider>
    </AuthorisationContext.Provider>
  );
}

export default App;
