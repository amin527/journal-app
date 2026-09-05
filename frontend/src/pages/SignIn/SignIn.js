import "./SignIn.css"
import TopNavbar from "../../components/TopNavbar/TopNavbar"
import { useState, useContext } from "react"
import { NavLink, useNavigate } from "react-router";
import { AuthorisationContext } from "../../App";

function SignIn() {
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(null)
    let navigate = useNavigate()
    const { setIsAuthorised } = useContext(AuthorisationContext)
    const API_URL = process.env.REACT_APP_API_URL;

    function handleSubmit(event) {
        event.preventDefault()
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
            <TopNavbar location="sign-in"></TopNavbar>
            <div className="body">
                <div className="input-field-container">
                    <div className="title">Sign In</div>
                    {!(error == null) && <div className="error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <input id="email" className="input-field" type="text" placeholder="Email" autoComplete="username" onChange={(event) => setEmail(event.target.value)} />
                        <input id="password" className="input-field" type="password" placeholder="Password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />
                        <div className="button-container">
                            <NavLink to="/sign-up" id="nav-link" className="sign-up-button button">Sign Up</NavLink>
                            <button type="submit" className="sign-in-button button">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default SignIn