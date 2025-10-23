import "./ChatArea.css"
import { useState, useContext } from "react"
import { EntryContext } from "../App"
import { ActiveJournalContext } from "../HomePage/HomePage"

function ChatArea() {
    let [draftMessage, setDraftMessage] = useState("")
    const { activeJournal } = useContext(ActiveJournalContext)
    const { entries, setEntries } = useContext(EntryContext)

    function handleClick() {
        if (!(draftMessage == "") && !(activeJournal == -1)) {
            const time = Date.now();
            setEntries((prev) => [...prev, { journal: activeJournal, time: time, entry: draftMessage }])
            setDraftMessage("")
        }
    }

    function displayMessages() {
        if (entries.length > 0) {
            return (
                <div className="messages">
                    {entries.filter(item => item.journal == activeJournal).map((item, index) => {
                        const date = new Date(item.time);
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        return (
                            <div key={index} className="message-container">
                                <div className="message">{item.entry}</div>
                                <div className="time-stamp">{hours}:{minutes}</div>
                            </div>)
                    })}
                </div>
            )
        }
    }
    return (
        <div className="chat-area">
            {displayMessages()}
            <div className="input-field-container">
                <input className="input-field" type="text" value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} onKeyDown={(e) => { (e.key === 'Enter') && handleClick() }} />
                <div className="button" onClick={handleClick} >Send</div>
            </div>
        </div>
    )
}
export default ChatArea