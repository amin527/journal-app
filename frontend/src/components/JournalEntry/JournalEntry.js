import "./JournalEntry.css"
import { useState, useRef, useContext, useEffect } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import { EntriesContext } from "../../App";
import { PiDotsThreeBold, PiPencilSimple, PiTrash } from "react-icons/pi";

function JournalEntry(props) {
    const journalEntry = props.item
    const date = new Date(journalEntry.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const { entries, setEntries } = useContext(EntriesContext)

    const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
    const [editingEntry, setEditingEntry] = useState(false)
    const [newEntry, setNewEntry] = useState(journalEntry.message)

    const buttonRef = useRef(null)
    const menuRef = useRef(null);
    const textareaRef = useRef(null);
    const API_URL = process.env.REACT_APP_API_URL;

    useClickOutside(menu, setMenu, menuRef, buttonRef)

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea === null) return
        textarea.style.height = "auto"
        textarea.style.height = textarea.scrollHeight + "px"
    }, [editingEntry, newEntry])

    useEffect(() => {
        if (editingEntry && textareaRef.current !== null) {
            const textarea = textareaRef.current
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
    }, [editingEntry])

    function handleMenuButton(event) {
        if (menu.visible) {
            setMenu({ ...menu, visible: false })
        } else {
            event.stopPropagation()
            setMenu({ ...menu, visible: true })
        }
    }

    async function deleteHandler() {
        setMenu({ ...menu, visible: false })
        const response = await fetch(`${API_URL}/delete-entry`, {
            method: "Post",
            body: JSON.stringify({ id: journalEntry.id }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        }).catch(response => { console.error(response) })
        if (response.status === 200) {
            setEntries(entries.filter(entry => entry.id !== journalEntry.id))
        }
        const payload = await response.json()
        console.log(payload)
    }

    async function editHandler(event) {
        event?.preventDefault()
        if (newEntry.trim() === "") return

        const response = await fetch(`${API_URL}/edit-entry`, {
            method: "Post",
            body: JSON.stringify({ id: journalEntry.id, newValue: newEntry }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        }).catch(response => { console.error(response) })
        if (response.status === 200) {
            setEntries(prevEntries =>
                prevEntries.map(entry => entry.id === journalEntry.id ? { ...entry, message: newEntry } : entry)
            )
        }
        setEditingEntry(false)
        const payload = await response.json()
        console.log(payload)
    }

    function cancelEditing() {
        setNewEntry(journalEntry.message)
        setEditingEntry(false)
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            editHandler()
        } else if (event.key === "Escape") {
            cancelEditing()
        }
    }

    function enableEditing() {
        setMenu({ ...menu, visible: false })
        setEditingEntry(true);
    }

    return (
        <article className={editingEntry ? "entry editing" : "entry"}>
            <div className="entry-meta">
                <time className="entry-time" dateTime={date.toISOString()}>{hours}:{minutes}</time>

                {!editingEntry &&
                    <div className="entry-menu" ref={buttonRef}>
                        <button
                            type="button"
                            className="entry-more"
                            aria-label="Entry options"
                            aria-haspopup="menu"
                            aria-expanded={menu.visible}
                            onClick={handleMenuButton}
                        >
                            <PiDotsThreeBold aria-hidden="true" />
                        </button>
                        {menu.visible && (
                            <div className="context-menu" role="menu" ref={menuRef}>
                                <button type="button" role="menuitem" className="menu-action" onClick={enableEditing}>
                                    <PiPencilSimple aria-hidden="true" />
                                    <span className="menu-action-name">Edit</span>
                                </button>
                                <button type="button" role="menuitem" className="menu-action danger" onClick={deleteHandler}>
                                    <PiTrash aria-hidden="true" />
                                    <span className="menu-action-name">Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                }
            </div>

            {editingEntry ?
                <form className="entry-edit" onSubmit={editHandler}>
                    <textarea
                        className="entry-edit-input"
                        aria-label="Edit entry"
                        ref={textareaRef}
                        rows={1}
                        value={newEntry}
                        onChange={(event) => setNewEntry(event.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="entry-edit-actions">
                        <button type="button" className="text-button" onClick={cancelEditing}>Cancel</button>
                        <button type="submit" className="text-button primary">Save</button>
                    </div>
                </form>
                :
                <p className="entry-text">{journalEntry.message}</p>
            }
        </article>
    )
}
export default JournalEntry
