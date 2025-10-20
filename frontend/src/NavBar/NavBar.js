import "./NavBar.css"
import { NavLink } from "react-router";

function NavBar(props) {
    return (
        <div className="nav-bar">
            {props.location === "home" &&
                <>
                    <div id="home-page" className="title">Title</div>
                    <NavLink to="/sign-in" id="home-page" className="button">Sign In</NavLink>
                </>
            }
            {props.location === "sign-in" &&
                <>
                    <NavLink id="sign-in-page" to="/" className="button">Back</NavLink>
                    <div id="sign-in-page" className="title">Title</div>
                </>
            }
        </div>
    )
}
export default NavBar