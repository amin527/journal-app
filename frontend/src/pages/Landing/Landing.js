import "./Landing.css"
import JournalPane from "../../components/JournalPane/JournalPane";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import JournalsSidePanel from "../../components/JournalsSidePanel/JournalsSidePanel";
import WelcomeHero from "../../components/WelcomeHero/WelcomeHero";
import { createContext, useState, useContext } from "react";
import { AuthorisationContext } from "../../App"

export const ActiveJournalContext = createContext()

function Landing() {
    let [activeJournal, setActiveJournal] = useState(-1)
    const { isAuthorised } = useContext(AuthorisationContext)

    return (
        <div className={isAuthorised ? "home-page" : "home-page home-page--guest"}>
            <TopNavbar location="home"></TopNavbar>
            {isAuthorised ?
            <div className="home-content-container">
                <ActiveJournalContext.Provider value={{activeJournal,  setActiveJournal }}>
                    <JournalsSidePanel></JournalsSidePanel>
                    <JournalPane></JournalPane>
                </ActiveJournalContext.Provider>
            </div>
            :
            <WelcomeHero></WelcomeHero>}
        </div>
    )
}
export default Landing