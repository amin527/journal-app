import "./Landing.css"
import JournalPane from "../../components/JournalPane/JournalPane";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import JournalsSidePanel from "../../components/JournalsSidePanel/JournalsSidePanel";
import { createContext, useState, useContext } from "react";
import { AuthorisationContext } from "../../App"

export const ActiveJournalContext = createContext()

function Landing() {
    let [activeJournal, setActiveJournal] = useState(-1)
    const { isAuthorised } = useContext(AuthorisationContext)

    return (
        <div className="home-page">
            <TopNavbar location="home"></TopNavbar>
            {isAuthorised ?
            <div className="home-content-container">
                <ActiveJournalContext.Provider value={{activeJournal,  setActiveJournal }}>
                    <JournalsSidePanel></JournalsSidePanel>
                    <JournalPane></JournalPane>
                </ActiveJournalContext.Provider>
            </div>
            :
            <div className="home-warning-message">You need to log in</div>}
        </div>
    )
}
export default Landing