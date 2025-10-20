import "./HomePage.css"
import ChatArea from "../ChatArea/ChatArea";
import NavBar from "../NavBar/NavBar";
import ChatPanel from "../ChatPanel/ChatPanel";

function HomePage() {
    return (
        <div className="home-page">
            <NavBar location="home"></NavBar>
            <div className="container">
                <ChatPanel></ChatPanel>
                <ChatArea></ChatArea>
            </div>
        </div>
    )
}
export default HomePage