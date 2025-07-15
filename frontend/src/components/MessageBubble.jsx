import React, { useEffect, useState, useRef } from 'react'
import { Plus, Reply, SmilePlus } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

import style from '../Styles/chatroom.module.css'


import {useChat} from '../context/ChatContext'



function MessageBubble({message, handleReply}) {
  
  const {state} = useChat()
  const { messages } = state
  const [hoverOver, sethoverOver] = useState(false)
  const [showPicker, setshowPicker] = useState(false)
  const pickerRef = useRef(null)


  

  useEffect(()=>{

    const handleOutsideClick = (event) =>{
      if(pickerRef.current && !pickerRef.current.contains(event.target)){
        setshowPicker(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick) //Binding event listre to whole document
    return ()=> document.removeEventListener("mousedown", handleOutsideClick)
  }, [])




  return (
    <div className={style.messageBubble} onMouseEnter={()=>sethoverOver(true)} onMouseLeave={()=>sethoverOver(false)} >
       
       {showPicker && <div className={style.emojiPicker} ref={pickerRef} > <EmojiPicker onEmojiClick={()=>setshowPicker(false)}  /> </div>}

       {hoverOver && <div className={style.reactionPicker}> 
                    <button>✅</button> 
                    <button>👀</button>  
                    <button>👍</button>
                    <Plus className={style.openReactionPicker} onClick={()=>setshowPicker(true)}  />  
                    <Reply className={style.messageReply} onClick={()=>handleReply(message)} />
                    </div>}

       <div className={style.avatarURL}>{message?.Sender.fullname.slice(0, 1).toUpperCase()}</div>
       
       {/* Message Content => Sender Name => Message Timestamp => message Reaction */}
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

      {
        message.reactions && (
          <div className={style.reactions}>
            {Object.entries(message.reactions).map(([emoji, users])=>(
              <div className={style.reaction}> {emoji} {users.length}  </div>
            ))}
          <SmilePlus size={18} style={{backgroundColor: "inherit", cursor: "pointer"}} />
          </div>
        )
      }


    </div>
  )
}

export default MessageBubble