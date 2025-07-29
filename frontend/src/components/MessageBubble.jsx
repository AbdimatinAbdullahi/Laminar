import React, { useEffect, useState, useRef } from 'react'
import { PencilLine, Plus, Reply, SmilePlus, Trash } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

import style from '../Styles/chatroom.module.css'


import {useChat} from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import EditMessageModal from '../modals/EditMessageModal'



function MessageBubble({message, handleReply}) {
  
  const {user} = useAuth()
  const pickerRef = useRef(null)
  const {state, sendReaction, sendDeleteMessage} = useChat()

  const [hoverOver, sethoverOver] = useState(false)
  const [showPicker, setshowPicker] = useState(false)
  const [showMessageEditModal, setShowMessageEditModal] = useState(false)
  

  useEffect(()=>{

    const handleOutsideClick = (event) =>{
      if(pickerRef.current && !pickerRef.current.contains(event.target)){
        setshowPicker(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick) //Binding event listre to whole document
    return ()=> document.removeEventListener("mousedown", handleOutsideClick)
  }, [])


  function handleReactionClick(emeojidata, event){
    setshowPicker(false)
    sendReaction(emeojidata.emoji, user.id, message.id)
  }

  function handleDeleteMessage(){
    const data = {
      type: "delete_message",
      data : {
        "delId" : message.id
      }
    }
    sendDeleteMessage(data)
  }



  return (
    <div className={style.messageBubble} key={message.id}  onMouseEnter={()=>sethoverOver(true)} onMouseLeave={()=>sethoverOver(false)} >
       
       {showPicker && <div className={style.emojiPicker} ref={pickerRef} > <EmojiPicker onEmojiClick={handleReactionClick}  /> </div>}
       {showMessageEditModal && <EditMessageModal message={message} onClose={()=>setShowMessageEditModal(false)} />}

       {hoverOver && !showMessageEditModal && <div className={style.reactionPicker}> 
                    <button>✅</button> 
                    <button>👀</button>  
                    <button>👍</button>
                    <Plus className={style.openReactionPicker} onClick={()=>setshowPicker(true)}  />  
                    <Reply className={style.messageReply} onClick={()=>handleReply(message)} />
                      {message.sender_id == user.id  && <Trash className={style.messageReply} onClick={handleDeleteMessage} />} 
                      {message.sender_id == user.id  && <PencilLine className={style.messageReply} onClick={()=>setShowMessageEditModal(true)} />} 
                    </div>}

       <div className={style.avatarURL}>{message?.Sender?.fullname.slice(0, 1).toUpperCase() || "?"}</div>
       
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
        !showMessageEditModal && message.reactions && (
          <div className={style.reactions}>
            {Object.entries(message.reactions).map(([emoji, users])=>(
              <div className={style.reaction} key={emoji} > {emoji} {users.length}  </div>
            ))}
          <SmilePlus size={18} style={{backgroundColor: "inherit", cursor: "pointer"}} onClick={()=>setshowPicker(!showPicker)} />
          </div>
        )
      }


    </div>
  )
}

export default MessageBubble