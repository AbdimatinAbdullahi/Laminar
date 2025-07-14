import React, { act, useEffect, useRef, useState, useLayoutEffect } from 'react'
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import MessageComposer from './Composer'

import {Phone, Video } from 'lucide-react'
import MessageBubble from './MessageBubble'

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

  // On intial render, Fetch the messages from backend without the cursor
  useEffect(()=>{
    fetchMessages()
  }, [activeChannel])


  // On scroll Fetch more messages depending on hasMoreMessage state
  const handleScroll = ()=>{
    const container = messageContainerRef.current;
    if(!container) return;

    if(container.scrollTop == 0 && hasMoreMessages){
      fetchMessages(messageCursor)
    }
  }
  return (
    <div className={style.converstationWindow}>
      <div className={style.messagesView} ref={messageContainerRef} onScroll={handleScroll}>
          { Array.isArray(messages) && messages.length > 0 ? messages.map((msg, index)=>(
              <MessageBubble message={msg} />
          )): <h2>No message</h2>}
      </div>
      <MessageComposer/>
    </div>
  )
}



export default Chat