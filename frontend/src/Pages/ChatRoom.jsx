import React, { useEffect, useState } from 'react'
// Its style I will Use it in Sidebar
import style from '../Styles/chatroom.module.css'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import UserBar from '../components/UserBar'
import FileModal from '../modals/FileModal'

function ChatRoom() {

  const {state, dispatch, fileModalOpen } = useChat()
  const [userbarActive, setUserbarActive] = useState(false)
  const [privateChannelJoinDenied, setPrivateChannelJoinDenied] = useState(false)


  const handleUserBarActive = ()=>{
    setUserbarActive(!userbarActive)
  }

  return (
    <div className={style.chatRoomContainer} >
      {fileModalOpen && <FileModal/>}
      <Sidebar state={state} dispatch={dispatch} setUserbarActive={setUserbarActive}/>
      <Chat handelUserBarActive={handleUserBarActive} />
      {userbarActive && <UserBar handleUserBarActive={handleUserBarActive}/>}
    </div>
  )
}

export default ChatRoom