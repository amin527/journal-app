import "./SignUp.css"
import NavBar from "../NavBar/NavBar"
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router"
import { AuthorisationContext } from "../App"

function SignUp() {
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(null)
    let navigate = useNavigate()
    const { setIsAuthorised } = useContext(AuthorisationContext)

    const API_URL = process.env.REACT_APP_API_URL;
    useEffect(() => {
        console.log(error)
    }, [error])

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
        fetch(`${API_URL}/auth/register`, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                localStorage.setItem('token', data.token);
                setIsAuthorised(true)
                navigate("/")
            })
            .catch(response => {setError("Invalid username or password"); console.error(response)});
    }


    return (
        <div className="sign-up">
            <NavBar location="sign-in"></NavBar>
            <div className="body">
                <div className="input-field-container">
                    <div className="title">Sign Up</div>
                    {!(error == null) && <div className="error">{error}</div>}
                    <input id="email" className="input-field" type="text" placeholder="Email" onChange={(event) => setEmail(event.target.value)} />
                    <input id="password" className="input-field" type="text" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                    <div className="button" onClick={handleClick}>Submit</div>
                </div>
            </div>
        </div>
    )
}
export default SignUp