import React, { act, useEffect, useState } from 'react'
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import { Bold, Italic, List, ListOrdered, Phone, Video } from 'lucide-react'

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



function MessageComposer(){

  const [selectedFile, setselectedFile] = useState(null)
  const [message, setmessage] = useState("")

  return (
    <div className={style.messageComposerContainer}>
        <div className={style.formatingIcons}>
          <Bold className={style.formattingIcon}  />
          <Italic className={style.formattingIcon}  />
          <List className={style.formattingIcon} />
          <ListOrdered className={style.formattingIcon}  />
        </div>

        <div className={style.messageContainer}>
          <input type="text" value={message} onChange={(e)=>setmessage(e.target.value)} />
        </div>

        {selectedFile && 
          (
            <div className={style.filePreviewContainer}>
              hello
            </div>
          )
        }

        <div className={style.messageFunctionality}>
            <div className={style.messagesAdds}>Hello</div>
            <div className={style.sendIcon}>Hello</div>
        </div>
    </div>
  )
}

export default Chat