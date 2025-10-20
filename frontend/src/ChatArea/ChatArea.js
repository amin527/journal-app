import "./ChatArea.css"
import { useState } from "react"

function ChatArea(){
    let [draftMessage, setDraftMessage] = useState("")

    return(
        <div className="chat-area">
            chat area
            <div className="input-field-container">
                <input className="input-field" type="text" onChange={(event) => setDraftMessage(event.target.value)}/>
                <div className="button">Send</div>
            </div>
        </div>
    )
}
export default ChatArea