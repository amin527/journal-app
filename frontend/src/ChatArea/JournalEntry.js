import "./JournalEntry.css"
import { useState, useRef, useContext, useEffect } from "react";
import useClickOutside from "../CustomHooks/useClickOutside";
import { EntriesContext } from "../App";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { BiSend } from "react-icons/bi";

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

    useClickOutside(menu, setMenu, menuRef, buttonRef)
    useEffect(() => {
        if (textareaRef.current !== null) {
            console.log("yessir")
            textareaRef.current.style.height = '42px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            if (textareaRef.current.scrollHeight > 42) {
                props.messagesRef.current.classList.add('editing');
            } 
        }
    }, [editingEntry])

function handleClick(event) {
    if (menu.visible) {
        setMenu({ visible: false, x: event.pageX, y: event.pageY })
    } else {
        event.stopPropagation()
        setMenu({ visible: true, x: event.pageX, y: event.pageY })
    }
}

async function deleteHandler() {
    const response = await fetch("http://localhost:8080/delete-entry", {
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
    setMenu({ ...menu, visible: false })
    const payload = await response.json()
    console.log(payload)
}

async function editHandler() {
    if (newEntry !== "") {
        const response = await fetch("http://localhost:8080/edit-entry", {
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
    props.messagesRef.current.classList.remove('editing');
}

function enableEditing() {
    setMenu({ ...menu, visible: false })
    setEditingEntry(true);
}

return (
    <div className={editingEntry ? "message-container editing" : "message-container viewing"} >
        {editingEntry ?
            <div className="left-block">
                <div className="input-container">
                    <textarea className="input-field" ref={textareaRef} onChange={(event) => setNewEntry(event.target.value)} value={newEntry} onKeyDown={(e) => { (e.key === 'Enter') && editHandler() }} />
                </div>
                <BiSend className="send-button" onClick={editHandler} />
            </div>
            :
            <div className="message">{journalEntry.message}</div>
        }
        <div className="right-block">
            <div ref={buttonRef}><BsThreeDots onClick={handleClick} className="menu-button" size={"1em"} /></div>
            {menu.visible && (
                <div className="context-menu" ref={menuRef}>
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
            <div className="time-stamp">{hours}:{minutes}</div>
        </div>
    </div>
)

}
export default JournalEntry