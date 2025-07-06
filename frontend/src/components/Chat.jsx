import React, { act, useEffect, useRef, useState } from 'react'
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import MessageComposer from './Composer'

import { Bold, Italic, List, ListOrdered, Mic, Phone, Plus, SendHorizonal, SmilePlus, Upload, Video } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

function Chat() {

    const { state } = useChat()
    const {activeChannel} = state

    if(!activeChannel) return <div className={style.emptyChannel}>  <h4>Select Channel</h4> </div>

  return (
    <div className={style.chatuiContainer}>
      <ChannelHeader channel={activeChannel} />
      <Converstation channel={activeChannel} />
    </div>
  )
}



function ChannelHeader({channel}){
  return (
    <div className={style.ChannelHeader}>
        {/* Name and Type of channel */}
        <div className={style.channelDetail}>
          <h3> # {channel.name}</h3>
          <p>{channel.is_private ? "Private" : "Public"}</p>
        </div>

        {/* Video Calling and Audio Calling  Plus displaying Users of the channel */}
        <div className={style.channelMeeting}>
          <Video className={style.meetingIcon} size={30} />
          <Phone className={style.meetingIcon}  size={30} />
        </div>
    </div>
  )
}


function Converstation({channel}){

  const messageContainerRef = useRef(null)
  const {state, fetchMessages, dispatch} = useChat()
  const {activeChannel, messageCursor, hasMoreMessages, messages} = state;

  useEffect(()=>{
    dispatch({type: "CLEAR_MESSAGES"})
    fetchMessages()
  }, [activeChannel])

  useEffect(()=>{
    console.log(`Messages for channel : ${activeChannel.name}`, messages)
  }, [messages])

  // Fetching messages from backend 
  const handleScroll = ()=>{
    const container = messageContainerRef.current;
    if(!container) return;

    if(container.scrollTop == 0 && hasMoreMessages){
      console.log("Logging message cursor: ", messageCursor)
      fetchMessages(messageCursor)
    }
  }

  return (
    <div className={style.converstationWindow}>
      <div className={style.messagesView} ref={messageContainerRef} onScroll={handleScroll}>
          {messages.map((msg, index)=>(
            <div className={style.messageBubble} key={msg.id} >
              <div> {index} </div>
              <div>{msg.content.text}</div>
              <div>{new Date(msg.timestamp).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second:"2-digit",
                hour12: true,

              })}</div>
            </div>
          ))}
      </div>
      <MessageComposer/>
    </div>
  )
}


export default Chat