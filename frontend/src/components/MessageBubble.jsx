import React, { useEffect, useState, useRef, useMemo } from 'react'
import { PencilLine, Plus, Reply, SmilePlus, Trash, Maximize2 } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

import style from '../Styles/chatroom.module.css'


import {useChat} from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import EditMessageModal from '../modals/EditMessageModal'
import axios from 'axios'



function MessageBubble({message, handleReply}) {
  
  const { user } = useAuth()
  const pickerRef = useRef(null)

  const [ hoverOver, sethoverOver ] = useState(false)
  const [ showPicker, setshowPicker ] = useState(false)

  const { sendReaction, sendDeleteMessage, OpenFileModal, state } = useChat()
  const [ showMessageEditModal, setShowMessageEditModal ] = useState(false)

  const [parentMessage, setParentMessage] = useState(null)


  useEffect(()=>{
    if(!message.thread_parent_id) return
    const localParent = state.messages.find(msg => msg.id === message.thread_parent_id)
    if(localParent){
      setParentMessage(localParent)
      return
    }

    async function fetchParentMessage(threadId) {
      const parentMessageRes = await axios.get(`http://localhost:8008/fetch_parent_message?parentMessageId=${threadId}`)
      setParentMessage(parentMessageRes.data)
    }
    fetchParentMessage(message.thread_parent_id)
  },[])


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
      payload : {
        "delId" : message.id
      }
    }
    sendDeleteMessage(data)
  }


  function handleScrollToParent(){
    const targetMessageId = parentMessage.id
    console.log(`The parent message id:`, parentMessage.id)
    const messageElement = document.getElementById(`message-${targetMessageId}`)
    if(messageElement){
      messageElement.scrollIntoView({behavior: "smooth", block: "center"})
      messageElement.classList.add("highlight")
      setTimeout(() => {
        messageElement.classList.remove("highlight")
      }, 2000);
    }
  }


  return (
    <div className={style.messageBubble} key={message.id} id={`message-${message.id}`} onMouseEnter={()=>sethoverOver(true)} onMouseLeave={()=>sethoverOver(false)} >
       
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

           {parentMessage && ( 
            <div className={style.parentMessage} onClick={handleScrollToParent}>
                <span className={style.replyInd}></span>
                <div className={style.replyContent}> 
                  {parentMessage.Sender.fullname}
                </div>
            </div> 
          )}

       {!showMessageEditModal && message.content.attachments && message.content.attachments.length > 0 && (
          <div className={style.attachemtContent}>
            {message.content.attachments[0].type.startsWith('image/') && (
              <div className={style.imageCon}>
                <Maximize2 onClick={()=> OpenFileModal({url : message.content.attachments[0].url, type: message.content.attachments[0].type})}  className={style.Maximize2Icon}/>
                <img
                  src={message.content.attachments[0].url}
                  alt={message.content.attachments[0].name}
                />
              </div>
            )}

            {message.content.attachments[0].type.startsWith('video/') && (
              <div className={style.videoCont}>
                <Maximize2 onClick={()=> OpenFileModal({url : message.content.attachments[0].url, type: message.content.attachments[0].type})}  className={style.Maximize2Icon}/>
                <video controls>
                  <source
                    src={message.content.attachments[0].url}
                    type={message.content.attachments[0].type}
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {message.content.attachments[0].type.startsWith("application/") && 
              <div className={style.fileContent}>
                <div className={style.fileIcon}>📃</div>
                <div className={style.fileIcon}> 
                  <a href={message.content.attachments[0].url} download={message.content.attachments[0].name}>
                    {message.content.attachments[0].name}
                  </a>
                </div>
              </div>
            }
          </div>
        )}

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