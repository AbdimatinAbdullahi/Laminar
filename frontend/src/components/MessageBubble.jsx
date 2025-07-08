import React from 'react'
import style from '../Styles/chatroom.module.css'

function MessageBubble({message}) {
  return (
    <div className={style.messageBubble}>
       
       <div className={style.avatarURL}>{message?.Sender.fullname.slice(0, 1).toUpperCase()}</div>
       
       <div className={style.messageContent}>

        <div className={style.senderItems}>
          <div className={style.senderName}>{message?.Sender.fullname}</div>
          <div className={style.sendTimestamp}>{new Date(message?.timestamp).toLocaleDateString("en-US", {day: "2-digit", month:"2-digit", year:"numeric", hour: "2-digit", minute:"2-digit", hour12: true})}</div>
        </div>

        <div className={style.messageText}>
          {message.content.text}
        </div>
        {message.edited  && <div className={style.edited}> {message.edited && "Edited"} </div>}
       </div>

    </div>
  )
}

export default MessageBubble