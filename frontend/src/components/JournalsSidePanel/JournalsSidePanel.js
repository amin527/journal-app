import "./JournalsSidePanel.css"
import { JournalsContext } from "../../App"
import { ActiveJournalContext } from "../../pages/Landing/Landing"
import { useContext, useState } from "react"
import JournalTitle from "../JournalTitle/JournalTitle"
import { PiPlusBold } from "react-icons/pi"

function JournalsSidePanel() {
    const API_URL = process.env.REACT_APP_API_URL;
    const { setJournals, journals } = useContext(JournalsContext)
    const { setActiveJournal, activeJournal } = useContext(ActiveJournalContext)
    const [newJounralName, setNewJournalName] = useState("")
    const [isErrorActive, setIsErrorActive] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        if (!(newJounralName.trim() === "")) {
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
        <aside className="chat-panel" aria-label="Journals">
            <div className="new-journal-container">
                <form className="new-journal-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="New journal"
                        aria-label="New journal name"
                        className="input-field"
                        type="text"
                        value={newJounralName}
                        onChange={(event) => setNewJournalName(event.target.value)}
                    />
                    <button
                        type="submit"
                        className={newJounralName.trim() === "" ? "button" : "button is-ready"}
                        aria-label="Create journal"
                        title="Create journal"
                    >
                        <PiPlusBold aria-hidden="true" />
                    </button>
                </form>

                {isErrorActive && <div className="warning-message" role="alert">Please provide a journal name</div>}
            </div>

            <div className="journal-list-header">
                <h2 className="journal-list-title">Journals</h2>
                <span className="journal-list-count">{journals.length}</span>
            </div>

            {journals.length > 0 ?
                <ul className="journal-list">
                    {journals.map((item) => (
                        <JournalTitle
                            key={item.id}
                            journalIsActive={activeJournal === item.id}
                            journalName={item.name}
                            journalId={item.id}
                        />
                    ))}
                </ul>
                :
                <p className="journal-list-empty">No journals yet. Name one above to get started.</p>
            }
        </aside>
    )
}
export default JournalsSidePanel
