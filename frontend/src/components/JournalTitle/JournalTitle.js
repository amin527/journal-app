import "./JournalTitle.css"
import { ActiveJournalContext } from "../../pages/Landing/Landing"
import { useContext, useState, useEffect, useRef } from "react"
import { EntriesContext, JournalsContext } from "../../App"
import useClickOutside from "../../hooks/useClickOutside"
import { PiDotsThreeBold, PiPencilSimple, PiTrash, PiNotebook } from "react-icons/pi";

function JournalTitle(props) {
    const journalName = props.journalName
    const journalId = props.journalId
    const API_URL = process.env.REACT_APP_API_URL;
    const { setActiveJournal } = useContext(ActiveJournalContext)
    const { setJournals, journals } = useContext(JournalsContext)
    const { entries, setEntries } = useContext(EntriesContext)

    const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
    const [editingJournalName, setEditingJournalName] = useState(false)
    const [newJournalName, setNewJournalName] = useState(journalName)

    const menuRef = useRef(null);
    const journalRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, [editingJournalName])

    useClickOutside(menu, setMenu, menuRef, journalRef)

    async function deleteHandler() {
        setMenu({ ...menu, visible: false })
        if (!window.confirm(`Delete "${journalName}" and all of its entries? This can't be undone.`)) return

        const response = await fetch(`${API_URL}/delete-journal`, {
            method: "Post",
            body: JSON.stringify({ id: journalId }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        }).catch(response => { console.error(response) })
        if (response.status === 200) {
            setJournals(journals.filter(journal => journal.id !== journalId))
            setEntries(entries.filter(entry => entry.journalId !== journalId))
        }
        const payload = await response.json()
        console.log(payload)
    }

    async function editHandler(event) {
        event.preventDefault()
        if (newJournalName.trim() === "") return

        const response = await fetch(`${API_URL}/edit-journal`, {
            method: "Post",
            body: JSON.stringify({ id: journalId, newValue: newJournalName }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        }).catch(response => { console.error(response) })
        if (response.status === 200) {
            setJournals(prevJournals =>
                prevJournals.map(journal => journal.id === journalId ? { ...journal, name: newJournalName } : journal)
            )
        }
        setEditingJournalName(false)
        const payload = await response.json()
        console.log(payload)
    }

    function cancelEditing() {
        setNewJournalName(journalName)
        setEditingJournalName(false)
    }

    function handleContextMenu(event) {
        event.preventDefault();
        setMenu({ visible: true, x: event.pageX, y: event.pageY });
    }

    function handleMenuButton(event) {
        if (menu.visible) {
            setMenu({ ...menu, visible: false })
        } else {
            event.stopPropagation()
            setMenu({ ...menu, visible: true })
        }
    }

    function enableEditing() {
        setEditingJournalName(true)
        setMenu({ ...menu, visible: false })
    }

    if (editingJournalName) {
        return (
            <li className="journal-item editing">
                <form className="journal-rename" onSubmit={editHandler}>
                    <input
                        className="journal-rename-input"
                        aria-label="Journal name"
                        ref={inputRef}
                        value={newJournalName}
                        onChange={(event) => setNewJournalName(event.target.value)}
                        onKeyDown={(e) => { (e.key === 'Escape') && cancelEditing() }}
                    />
                    <div className="journal-rename-actions">
                        <button type="button" className="text-button" onClick={cancelEditing}>Cancel</button>
                        <button type="submit" className="text-button primary">Save</button>
                    </div>
                </form>
            </li>
        )
    }

    return (
        <li
            className={props.journalIsActive ? "journal-item active" : "journal-item"}
            ref={journalRef}
            onContextMenu={handleContextMenu}
        >
            <button
                type="button"
                className="journal-select"
                aria-current={props.journalIsActive ? "page" : undefined}
                onClick={() => setActiveJournal(journalId)}
            >
                <PiNotebook className="journal-icon" aria-hidden="true" />
                <span className="journal-name">{journalName}</span>
            </button>
            <button
                type="button"
                className="journal-more"
                aria-label={`Options for ${journalName}`}
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
                        <span className="menu-action-name">Rename</span>
                    </button>
                    <button type="button" role="menuitem" className="menu-action danger" onClick={deleteHandler}>
                        <PiTrash aria-hidden="true" />
                        <span className="menu-action-name">Delete</span>
                    </button>
                </div>
            )}
        </li>
    )
}
export default JournalTitle
