import "./SignIn.css"
import NavBar from "../NavBar/NavBar"

function SignIn() {
    return (
        <div className="sign-in">
            <NavBar location="sign-in"></NavBar>
            <div className="body">
                <div className="input-field-container">
                    <div className="title">Sign In</div>
                    <input id="email" className="input-field" type="text" />
                    <input id="password" className="input-field" type="text" />
                </div>
            </div>
        </div>
    )
}
export default SignIn