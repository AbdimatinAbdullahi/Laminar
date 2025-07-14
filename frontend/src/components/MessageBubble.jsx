import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import style from '../Styles/chatroom.module.css'
import { Plus, Reply } from 'lucide-react'
import EmojiPicker, { Emoji } from 'emoji-picker-react'
import {useChat} from '../context/ChatContext'



function MessageBubble({message}) {
  
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


  useEffect(()=>{
    if(message.thread_parent_id){
       console.log("Looking for parent ID:", message.thread_parent_id);
      console.log("Messages currently loaded:", messages.map(m => m.id));
      const parent = messages.find((msg) => msg.id === message.thread_parent_id)
      console.log("Parent message", parent)
    }
  }, [message, messages])





  return (
    <div className={style.messageBubble} onMouseEnter={()=>sethoverOver(true)} onMouseLeave={()=>sethoverOver(false)} >
       
       {showPicker && <div className={style.emojiPicker} ref={pickerRef} > <EmojiPicker onEmojiClick={()=>setshowPicker(false)}  /> </div>}

       {hoverOver && <div className={style.reactionPicker}> 
                    <button>✅</button> 
                    <button>👀</button>  
                    <button>👍</button>
                    <Plus className={style.openReactionPicker} onClick={()=>setshowPicker(true)}  />  
                    <Reply className={style.messageReply} />
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

    </div>
  )
}

export default MessageBubble