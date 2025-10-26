import "./ChatArea.css"
import { useState, useContext, useRef, useEffect } from "react"
import { EntriesContext } from "../App"
import { ActiveJournalContext } from "../HomePage/HomePage"
import JournalEntry from "./JournalEntry"
import { BiSend } from "react-icons/bi";

function ChatArea() {
    let [draftMessage, setDraftMessage] = useState("")
    const { activeJournal } = useContext(ActiveJournalContext)
    const { entries, setEntries } = useContext(EntriesContext)
    const messagesRef = useRef(null)
    const textareaRef = useRef(null)
    const buttonRef = useRef(null)
    const API_URL = process.env.REACT_APP_API_URL;
    
    useEffect(() => {
        if (textareaRef.current !== null) {
            textareaRef.current.style.height = '20px';
            buttonRef.current.style.height = '20px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            buttonRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [draftMessage])

    async function handleClick() {
        if (!(draftMessage === "") && !(activeJournal === -1)) {
            const response = await fetch(`${API_URL}/add-entry`, {
                method: "Post",
                body: JSON.stringify({
                    message: draftMessage,
                    journalId: activeJournal
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            }).catch(response => { console.error(response) })
            const payload = await response.json()
            setEntries((prev) => [...prev, { id: payload.id, journalId: activeJournal, timestamp: payload.timestamp, message: draftMessage }])
            setDraftMessage("")
            console.log(payload)
        }
    }

    function displayJournalEntries() {
        const entriesOfActiveJournal = entries.filter(item => item.journalId === activeJournal)
        return (
            <div className="messages" ref={messagesRef}>
                {activeJournal !== -1
                    ? (entriesOfActiveJournal.length > 0
                        ? entriesOfActiveJournal.map((item, index) => { return (<JournalEntry messagesRef={messagesRef} key={index} item={item} />) })
                        : <div className="warning-message">No entries in this journal!</div>
                    )
                    : <div className="warning-message">Please select a journal</div>
                }
            </div>
        )
    }

    return (
        <div className="chat-area">
            {displayJournalEntries()}
            <div className="input-field-container">
                <textarea ref={textareaRef} className="input-field" placeholder="Type a message" type="text" value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} onKeyDown={(e) => { (e.key === 'Enter') && handleClick() }} />
                <div ref={buttonRef} className="button" onClick={handleClick} ><BiSend size="1.4em"/></div>
            </div>
        </div>
    )
}
export default ChatArea