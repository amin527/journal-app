import { Routes, Route } from "react-router"
import HomePage from "./HomePage/HomePage";
import SignIn from "./SignIn/SignIn";

function App() {
  return (
    <div className="app">
      <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/sign-in" element={<SignIn />} />
      </Routes>
      
    </div>
  );
}

export default App;
