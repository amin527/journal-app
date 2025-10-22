import { Routes, Route } from "react-router"
import HomePage from "./HomePage/HomePage";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";
import { useState, useEffect } from "react";
import { createContext } from 'react';

export const AuthorisationContext = createContext();

function App() {
  let [isAuthorised, setIsAuthorised] = useState(false)

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token")
      if (!(token == null)) {  
        const response = await fetch("http://localhost:8080/get-user-info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }).catch(error => console.error(error))
        const payload = await response.json();
        if(!(payload.username == null)){
          setIsAuthorised(true)
        }
      }
    }
    fetchUserInfo()
  })

  return (
    <AuthorisationContext.Provider value={{ isAuthorised, setIsAuthorised }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </AuthorisationContext.Provider>
  );
}

export default App;
