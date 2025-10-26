import "./HomePage.css"
import ChatArea from "../ChatArea/ChatArea";
import NavBar from "../NavBar/NavBar";
import ChatPanel from "../ChatPanel/ChatPanel";
import { createContext, useState, useContext } from "react";
import { AuthorisationContext } from "../App"

export const ActiveJournalContext = createContext()

function HomePage() {
    let [activeJournal, setActiveJournal] = useState(-1)
    const { isAuthorised } = useContext(AuthorisationContext)

    return (
        <div className="home-page">
            <NavBar location="home"></NavBar>
            {isAuthorised ? 
            <div className="home-content-container">
                <ActiveJournalContext.Provider value={{activeJournal,  setActiveJournal }}>
                    <ChatPanel></ChatPanel>
                    <ChatArea></ChatArea>
                </ActiveJournalContext.Provider>
            </div>
            : 
            <div className="home-warning-message">You need to log in</div>}
        </div>
    )
}
export default HomePage