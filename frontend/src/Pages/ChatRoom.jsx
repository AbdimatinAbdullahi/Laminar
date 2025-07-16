import React, { useEffect, useState } from 'react'
// Its style I will Use it in Sidebar
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import UserBar from '../components/UserBar'

function ChatRoom() {

  const {state, dispatch} = useChat()
  const [userbarActive, setUserbarActive] = useState(false)

  const handleUserBarActive = ()=>{
    console.log("Users bar clicked!")
    setUserbarActive(!userbarActive)
  }

  return (
    <div className={style.chatRoomContainer} >
      <Sidebar state={state} dispatch={dispatch} />
      <Chat handelUserBarActive={handleUserBarActive} />
      {userbarActive && <UserBar handleUserBarActive={handleUserBarActive}/>}
    </div>
  )
}

export default ChatRoom