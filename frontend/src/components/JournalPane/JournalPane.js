import "./JournalPane.css"
import { useState, useContext, useRef, useEffect } from "react"
import { EntriesContext, JournalsContext } from "../../App"
import { ActiveJournalContext } from "../../pages/Landing/Landing"
import JournalEntry from "../JournalEntry/JournalEntry"
import { PiArrowUpBold, PiFeather, PiNotebook } from "react-icons/pi";

function formatDayLabel(date) {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

    const options = { weekday: "long", day: "numeric", month: "long" }
    if (date.getFullYear() !== today.getFullYear()) options.year = "numeric"
    return date.toLocaleDateString(undefined, options)
}

function JournalPane() {
    let [draftMessage, setDraftMessage] = useState("")
    const { activeJournal } = useContext(ActiveJournalContext)
    const { entries, setEntries } = useContext(EntriesContext)
    const { journals } = useContext(JournalsContext)
    const messagesRef = useRef(null)
    const textareaRef = useRef(null)
    const API_URL = process.env.REACT_APP_API_URL;

    const activeJournalName = journals.find(journal => journal.id === activeJournal)?.name
    const entriesOfActiveJournal = entries.filter(item => item.journalId === activeJournal)
    const hasJournal = activeJournal !== -1

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea === null) return
        textarea.style.height = "auto"
        textarea.style.height = textarea.scrollHeight + "px"
    }, [draftMessage])

    useEffect(() => {
        const list = messagesRef.current
        if (list !== null) list.scrollTop = list.scrollHeight
    }, [activeJournal, entriesOfActiveJournal.length])

    async function handleSubmit(event) {
        event?.preventDefault()
        if (!(draftMessage.trim() === "") && hasJournal) {
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

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            handleSubmit()
        }
    }

    function displayJournalEntries() {
        if (!hasJournal) {
            return (
                <div className="pane-empty">
                    <PiNotebook className="pane-empty-icon" aria-hidden="true" />
                    <h2 className="pane-empty-title">Pick a journal</h2>
                    <p className="pane-empty-text">Choose one from the list, or create a new journal to start writing.</p>
                </div>
            )
        }

        if (entriesOfActiveJournal.length === 0) {
            return (
                <div className="pane-empty">
                    <PiFeather className="pane-empty-icon" aria-hidden="true" />
                    <h2 className="pane-empty-title">A blank page</h2>
                    <p className="pane-empty-text">Write your first entry below.</p>
                </div>
            )
        }

        let previousDay = null
        return (
            <ol className="entry-list">
                {entriesOfActiveJournal.map((item) => {
                    const date = new Date(item.timestamp)
                    const day = date.toDateString()
                    const showDay = day !== previousDay
                    previousDay = day
                    return (
                        <li key={item.id} className="entry-list-item">
                            {showDay && <h3 className="day-divider">{formatDayLabel(date)}</h3>}
                            <JournalEntry messagesRef={messagesRef} item={item} />
                        </li>
                    )
                })}
            </ol>
        )
    }

    return (
        <main className="chat-area">
            {hasJournal &&
                <header className="pane-header">
                    <h1 className="pane-title">{activeJournalName}</h1>
                    <span className="pane-meta">
                        {entriesOfActiveJournal.length} {entriesOfActiveJournal.length === 1 ? "entry" : "entries"}
                    </span>
                </header>
            }

            <div className="messages" ref={messagesRef}>
                <div className="pane-column">
                    {displayJournalEntries()}
                </div>
            </div>

            {hasJournal &&
                <div className="composer-wrapper">
                    <form className="composer pane-column" onSubmit={handleSubmit}>
                        <textarea
                            ref={textareaRef}
                            className="composer-input"
                            aria-label="New entry"
                            placeholder="Write something…"
                            rows={1}
                            value={draftMessage}
                            onChange={(event) => setDraftMessage(event.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="submit"
                            className={draftMessage.trim() === "" ? "composer-send" : "composer-send is-ready"}
                            aria-label="Save entry"
                            title="Save entry"
                        >
                            <PiArrowUpBold aria-hidden="true" />
                        </button>
                    </form>
                    <p className="composer-hint pane-column">Enter to save · Shift + Enter for a new line</p>
                </div>
            }
        </main>
    )
}
export default JournalPane
