import "./JournalsSidePanel.css"
import { JournalsContext } from "../../App"
import { ActiveJournalContext } from "../../pages/Landing/Landing"
import { useContext, useState } from "react"
import JournalTitle from "../JournalTitle/JournalTitle"
import { AiOutlinePlus } from "react-icons/ai"

function JournalsSidePanel() {
    const API_URL = process.env.REACT_APP_API_URL;
    const { setJournals, journals } = useContext(JournalsContext)
    const { setActiveJournal, activeJournal } = useContext(ActiveJournalContext)
    const [newJounralName, setNewJournalName] = useState("")
    const [isErrorActive, setIsErrorActive] = useState(false)

    async function handleClick() {
        if (!(newJounralName === "")) {
            setIsErrorActive(false)
            const response = await fetch(`${API_URL}/add-journal`, {
                method: "Post",
                body: JSON.stringify({ journalName: newJounralName }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            }).catch(response => { console.error(response) })
            const payload = await response.json()
            console.log(payload)

            setJournals([...journals, { id: payload.journalId, name: newJounralName, timestamp: payload.timestamp }])
            setNewJournalName("")
            setActiveJournal(payload.journalId)
        } else {
            setIsErrorActive(true)
        }
    }

    return (
        <div className="chat-panel">
            <div className="new-journal-container">
                <div className="top-section">
                    <input
                        placeholder="New journal"
                        className="input-field"
                        type="text"
                        value={newJounralName}
                        onChange={(event) => setNewJournalName(event.target.value)}
                        onKeyDown={(e) => { (e.key === 'Enter') && handleClick() }}
                    />
                    <div onClick={handleClick} className="button" title="Create journal">
                        <AiOutlinePlus />
                    </div>
                </div>

                {isErrorActive && <div className="warning-message">Please provide a journal name</div>}
            </div>
            {journals.length > 0 && journals.map((item, index) => {
                return activeJournal === item.id
                    ? <JournalTitle journalIsActive={true} key={index} journalName={item.name} journalId={item.id} />
                    : <JournalTitle journalIsActive={false} key={index} journalName={item.name} journalId={item.id} />
            })
            }
        </div>
    )
}
export default JournalsSidePanel