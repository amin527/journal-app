import "./ChatPanel.css"
import { JournalsContext } from "../App"
import { ActiveJournalContext } from "../HomePage/HomePage"
import { useContext, useState } from "react"
import Journal from "./Journal"

function ChatPanel() {
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
                        placeholder="New Journal"
                        className="input-field"
                        type="text"
                        value={newJounralName}
                        onChange={(event) => setNewJournalName(event.target.value)}
                        onKeyDown={(e) => { (e.key === 'Enter') && handleClick() }}
                    />
                    <div onClick={handleClick} className="button">New</div>
                </div>

                {isErrorActive && <div className="warning-message">Please provide a journal name</div>}
            </div>
            {journals.length > 0 && journals.map((item, index) => {
                return activeJournal === item.id
                    ? <Journal journalIsActive={true} key={index} journalName={item.name} journalId={item.id} />
                    : <Journal journalIsActive={false} key={index} journalName={item.name} journalId={item.id} />
            })
            }
        </div>
    )
}
export default ChatPanel