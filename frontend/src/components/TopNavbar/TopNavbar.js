import "./TopNavbar.css"
import { NavLink } from "react-router";
import { useContext } from "react"
import { AuthorisationContext } from "../../App";
import { PiNotebook, PiSignOut } from "react-icons/pi";

function TopNavbar(props) {
    const {isAuthorised, setIsAuthorised} = useContext(AuthorisationContext)

    function handleLogOut(){
        setIsAuthorised(false)
        localStorage.removeItem('token');
    }

    if (props.location === "home" && isAuthorised) {
        return (
            <header className="nav-bar nav-bar--app">
                <div className="app-brand">
                    <PiNotebook className="app-brand-icon" aria-hidden="true" />
                    <span className="app-brand-name">My Diary</span>
                </div>
                <button type="button" className="app-logout" onClick={handleLogOut}>
                    <PiSignOut aria-hidden="true" />
                    <span>Log out</span>
                </button>
            </header>
        )
    }

    return (
        <div className="nav-bar">
            {props.location === "home" &&
                <>
                    <div id="home-page" className="title">My Diary</div>
                    <NavLink to="/sign-in" id="home-page" className="button">Sign In</NavLink>
                </>
            }
            {props.location === "sign-in" &&
                <>
                    <NavLink id="sign-in-page" to="/" className="button">Home</NavLink>
                    <div id="sign-in-page" className="title">My Diary</div>
                </>
            }
        </div>
    )
}
export default TopNavbar