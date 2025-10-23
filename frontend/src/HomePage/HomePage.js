import "./HomePage.css"
import ChatArea from "../ChatArea/ChatArea";
import NavBar from "../NavBar/NavBar";
import ChatPanel from "../ChatPanel/ChatPanel";
import { createContext, useState } from "react";

export const ActiveJournalContext = createContext()

function HomePage() {
    let [activeJournal, setActiveJournal] = useState(-1)

    return (
        <div className="home-page">
            <NavBar location="home"></NavBar>
            <div className="home-content-container">
                <ActiveJournalContext.Provider value={{activeJournal,  setActiveJournal }}>
                    <ChatPanel></ChatPanel>
                    <ChatArea></ChatArea>
                </ActiveJournalContext.Provider>
            </div>
        </div>
    )
}
export default HomePage