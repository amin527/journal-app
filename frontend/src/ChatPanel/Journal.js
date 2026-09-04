import "./Journal.css"
import { ActiveJournalContext } from "../HomePage/HomePage"
import { useContext, useState, useEffect, useRef } from "react"
import { EntriesContext, JournalsContext } from "../App"
import useClickOutside from "../CustomHooks/useClickOutside"
import { AiFillEdit, AiFillDelete } from "react-icons/ai";

function Journal(props) {
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
    }, [editingJournalName])

    useClickOutside(menu, setMenu, menuRef, journalRef)

    async function deleteHandler() {
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
        setMenu({ ...menu, visible: false })
        const payload = await response.json()
        console.log(payload)
    }

    async function editHandler() {
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

    function handleContextMenu(event) {
        event.preventDefault();
        setMenu({
            visible: true,
            x: event.pageX,
            y: event.pageY,
        });
    }

    function enableEditing() {
        setEditingJournalName(true)
        setMenu({ ...menu, visible: false })
    }

    return (
        <>
            {editingJournalName ?
                <div className="journal-container" >
                    <div className="input-field-container">
                        <input className="input-field" ref={inputRef} onChange={(event) => setNewJournalName(event.target.value)} value={newJournalName} onKeyDown={(e) => { (e.key === 'Enter') && editHandler() }} />
                        <div className="button" onClick={editHandler}>Save</div>
                    </div>
                </div>
                :
                <>
                    {props.journalIsActive ?
                        <div className="journal-container active" ref={journalRef} onContextMenu={handleContextMenu} >{journalName}</div>
                        :
                        <div className="journal-container inactive" ref={journalRef} onContextMenu={handleContextMenu} onClick={() => setActiveJournal(journalId)}>{journalName}</div>
                    }
                </>
            }

            {menu.visible && (
                <div className="context-menu" ref={menuRef} style={{ top: menu.y, left: menu.x }}>
                    <div className="menu-action" onClick={enableEditing}>
                        <AiFillEdit />
                        <div className="menu-action-name">Edit</div>
                    </div>
                    <div className="menu-action" onClick={deleteHandler}>
                        <AiFillDelete />
                        <div className="menu-action-name">Delete</div>
                    </div>
                </div>
            )}
        </>
    )
}
export default Journal