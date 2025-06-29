import React from 'react'
// Its style I will Use it in Sidebar
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'

function ChatRoom() {

  const {state, dispatch} = useChat()

  return (
    <div className={style.chatRoomContainer} >
      <Sidebar state={state} dispatch={dispatch} />
      <Chat />
    </div>
  )
}

export default ChatRoom