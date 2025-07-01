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
  return (
    <div className={style.converstationWindow}>
      <div className={style.messagesView}>
        <h2>Messages from {channel.name} goes here 🎉🎉🙌</h2>
      </div>
      <MessageComposer/>
    </div>
  )
}


export default Chat