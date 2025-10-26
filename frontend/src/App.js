import { Routes, Route } from "react-router"
import "./App.css"
import HomePage from "./HomePage/HomePage";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";
import { useState, useEffect, createContext } from "react";

export const AuthorisationContext = createContext()
export const JournalsContext = createContext()
export const EntriesContext = createContext()

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
  }, [isAuthorised])

  return (
    <AuthorisationContext.Provider value={{ isAuthorised, setIsAuthorised, journals, setJournals }}>
      <JournalsContext.Provider value={{ journals, setJournals }}>
        <EntriesContext.Provider value={{ entries, setEntries }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </EntriesContext.Provider>
      </JournalsContext.Provider>
    </AuthorisationContext.Provider>
  );
}

export default App;
