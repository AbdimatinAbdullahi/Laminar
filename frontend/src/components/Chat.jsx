import React, { useEffect, useRef, useState, useLayoutEffect, useCallback, act } from 'react'
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import MessageComposer from './Composer'

import {Phone, UserPlus, Users, Video } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ChannelCreationModal from '../modals/ChannelCreationModal'
import WorkspaceCreateModal from '../modals/WorkspaceCreateModal'
import AddUserModal from '../modals/AddUserModal'

function Chat({handelUserBarActive}) {

    const { state, createChannelModalOpen, workspaceCreateModalOpen, AddUserModalOpen, setAddUserModalOpen } = useChat()
    const { activeChannel } = state


  return (
    <>

    {activeChannel ? (
      <div className={style.chatuiContainer}>
        <ChannelHeader channel={activeChannel} handelUserBarActive={handelUserBarActive} />
        <Converstation channel={activeChannel} />
      </div>
      ):
      (
        <div className={style.emptyChannel}>
            <h4>Select Channel</h4> 
        </div>
    )}

      { workspaceCreateModalOpen && <WorkspaceCreateModal/> }
      { createChannelModalOpen && <ChannelCreationModal/> }
      { AddUserModalOpen && <AddUserModal onClose={()=>setAddUserModalOpen(false)} /> }

    </>
  )
}



function ChannelHeader({channel, handelUserBarActive}){

  const { setAddUserModalOpen } = useChat()

  return (
    <div className={style.ChannelHeader}>
        {/* Name and Type of channel */}
        <div className={style.channelDetail}>
          <h3> # {channel.name}</h3>
          <p>{channel.is_private ? "Private" : "Public"}</p>
        </div>

        {/* Video Calling and Audio Calling  Plus displaying Users of the channel */}
        <div className={style.channelMeeting}>
          {channel.is_private && <UserPlus onClick={()=> setAddUserModalOpen(true)} />}
          <Users className={style.meetingIcon} size={30}  onClick={()=>handelUserBarActive()} />
        </div>
    </div>
  )
}


function Converstation({channel}){

  const { state, fetchMessages } = useChat()
  const [replyTo, setReplyTo] = useState(null)
  const messageContainerRef = useRef(null)

  const handleReply = useCallback((message) => setReplyTo(message), [])
  const {activeChannel, messageCursor, hasMoreMessages, messages} = state;
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)

  // On intial render, Fetch the messages from backend without the cursor
  useEffect(()=>{
    fetchMessages()
  }, [activeChannel])


  const loadMoreMessages = async () => {
    setLoadingMoreMessages(true);
    const container = messageContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    await fetchMessages(messageCursor);

    // Optional: Maintain scroll position
    setTimeout(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      }
    }, 5000);

    setLoadingMoreMessages(false);
  };


  // On scroll Fetch more messages depending on hasMoreMessage state
  const handleScroll = ()=>{
    const container = messageContainerRef.current;
    if(!container) return;

    if(container.scrollTop == 0 && hasMoreMessages){
      loadMoreMessages()
    }
  }
 
  
  return (
    <div className={style.converstationWindow}>
      <div className={style.messagesView} ref={messageContainerRef} onScroll={handleScroll}>
        {loadingMoreMessages && <div className={style.loadingMoreMessages}> loading ... </div>}
          { Array.isArray(messages) && messages.length > 0 ? messages.map((msg, index)=>(
              <MessageBubble message={msg} handleReply={handleReply} key={index} replyTo={replyTo} />
          )): <h2>No message</h2>}
      </div>
      <MessageComposer replyTo={replyTo} handleReply={handleReply} setReplyTo={setReplyTo} />
    </div>
  )
}



export default Chat