import "../Auth.css"
import TopNavbar from "../../components/TopNavbar/TopNavbar"
import { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router"
import { AuthorisationContext } from "../../App"

function SignUp() {
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(null)
    let [isSubmitting, setIsSubmitting] = useState(false)
    let navigate = useNavigate()
    const { setIsAuthorised } = useContext(AuthorisationContext)

    const API_URL = process.env.REACT_APP_API_URL;
    useEffect(() => {
        console.log(error)
    }, [error])

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
            .catch(response => {setError("We couldn't create your account. Check your email and password and try again."); console.error(response)})
            .finally(() => setIsSubmitting(false));
    }


    return (
        <div className="auth-page">
            <TopNavbar location="sign-in"></TopNavbar>
            <main className="auth-body">
                <div className="auth-card">
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">Start your private journal in seconds.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!(error == null) && <p className="auth-error" role="alert">{error}</p>}

                        <div className="auth-field">
                            <label htmlFor="email" className="auth-label">Email</label>
                            <input id="email" className="auth-input" type="email" autoComplete="email" required onChange={(event) => setEmail(event.target.value)} />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password" className="auth-label">Password</label>
                            <input id="password" className="auth-input" type="password" autoComplete="new-password" required onChange={(event) => setPassword(event.target.value)} />
                        </div>

                        <button type="submit" className="auth-submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account…" : "Create account"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/sign-in">Sign in</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
export default SignUp
