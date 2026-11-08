import "../Auth.css"
import TopNavbar from "../../components/TopNavbar/TopNavbar"
import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router";
import { AuthorisationContext } from "../../App";

function SignIn() {
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(null)
    let [isSubmitting, setIsSubmitting] = useState(false)
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
        setIsSubmitting(true)
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
            .catch(response => {setError("Incorrect email or password. Please try again."); console.error(response)})
            .finally(() => setIsSubmitting(false));
    }

    return (
        <div className="auth-page">
            <TopNavbar location="sign-in"></TopNavbar>
            <main className="auth-body">
                <div className="auth-card">
                    <h1 className="auth-title">Sign in</h1>
                    <p className="auth-subtitle">Welcome back to My Diary.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!(error == null) && <p className="auth-error" role="alert">{error}</p>}

                        <div className="auth-field">
                            <label htmlFor="email" className="auth-label">Email</label>
                            <input id="email" className="auth-input" type="email" autoComplete="username" required onChange={(event) => setEmail(event.target.value)} />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password" className="auth-label">Password</label>
                            <input id="password" className="auth-input" type="password" autoComplete="current-password" required onChange={(event) => setPassword(event.target.value)} />
                        </div>

                        <button type="submit" className="auth-submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/sign-up">Sign up</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
export default SignIn
