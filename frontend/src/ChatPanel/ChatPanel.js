import "./ChatPanel.css"
import { JournalContext } from "../App"
import { ActiveJournalContext } from "../HomePage/HomePage"
import { useContext, useState, useEffect } from "react"

function ChatPanel() {
    const { setJournals, journals } = useContext(JournalContext)
    const { setActiveJournal, activeJournal } = useContext(ActiveJournalContext)
    const [newJounralName, setNewJournalName] = useState("")

    useEffect(() => {
        console.log("Active Journal: " + activeJournal)
        console.log("journals: " + journals)
    })

    function handleClick() {
        if (!(newJounralName == "")) {
            let HIGHEST_JOURNAL_ID
            HIGHEST_JOURNAL_ID = journals.length === 0 ? 0 : Math.max(...journals.map(item => item.id));
            const NEW_JOURNAL_ID = HIGHEST_JOURNAL_ID + 1
            setJournals([...journals, { id: NEW_JOURNAL_ID, name: newJounralName }])
            setNewJournalName("")
            setActiveJournal(NEW_JOURNAL_ID)
        }
    }

    return (
        <div className="chat-panel">
            <div className="new-journal-container">
                <input
                    className="input-field"
                    type="text"
                    value={newJounralName}
                    onChange={(event) => setNewJournalName(event.target.value)}
                    onKeyDown={(e) => { (e.key === 'Enter') && handleClick() }}
                />
                <div onClick={handleClick} className="button">New</div>
            </div>
            {journals.length > 0 && journals.map((item, index) => {
                return activeJournal === item.id
                    ? <div key={index} className="journal-name active">{item.name}</div>
                    : <div key={index} onClick={() => setActiveJournal(item.id)} className="journal-name inactive">{item.name}</div>;
            })
            }
        </div>
    )
}
export default ChatPanel