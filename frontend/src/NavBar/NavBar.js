import "./NavBar.css"
import { NavLink } from "react-router";
import { useContext } from "react"
import { AuthorisationContext } from "../App";

function NavBar(props) {
    const {isAuthorised, setIsAuthorised} = useContext(AuthorisationContext)

    function handleLogOut(){
        setIsAuthorised(false)
        localStorage.removeItem('token');
    }

    return (
        <div className="nav-bar">
            {props.location === "home" &&
                <>
                    <div id="home-page" className="title">Title</div>
                    {!isAuthorised && <NavLink to="/sign-in" id="home-page" className="button">Sign In</NavLink>}
                    {isAuthorised && <div id="home-page" className="button" onClick={handleLogOut}>Log Out</div>}
                </>
            }
            {props.location === "sign-in" &&
                <>
                    <NavLink id="sign-in-page" to="/" className="button">Home</NavLink>
                    <div id="sign-in-page" className="title">Title</div>
                </>
            }
        </div>
    )
}
export default NavBar