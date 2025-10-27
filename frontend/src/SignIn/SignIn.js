import "./SignIn.css"
import NavBar from "../NavBar/NavBar"
import { useState, useContext } from "react"
import { NavLink, useNavigate } from "react-router";
import { AuthorisationContext } from "../App";

function SignIn() {
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(null)
    let navigate = useNavigate()
    const { setIsAuthorised } = useContext(AuthorisationContext)
    const API_URL = process.env.REACT_APP_API_URL;

    function handleClick() {
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: email,
                password: password
            })
        }
        setError(null)
        fetch(`${API_URL}/auth/authenticate`, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('token', data.token);
                setIsAuthorised(true)
                navigate("/")
            })
            .catch(response => {setError("Invalid username or password"); console.error(response)});
    }

    return (
        <div className="sign-in">
            <NavBar location="sign-in"></NavBar>
            <div className="body">
                <div className="input-field-container">
                    <div className="title">Sign In</div>
                    {!(error == null) && <div className="error">{error}</div>}
                    <input id="email" className="input-field" type="text" placeholder="Email" onChange={(event) => setEmail(event.target.value)} />
                    <input id="password" className="input-field" type="text" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                    <div className="button-container">
                        <NavLink to="/sign-up" id="nav-link" className="button">Create Account ?</NavLink>
                        <div className="button" onClick={handleClick}>Submit</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SignIn