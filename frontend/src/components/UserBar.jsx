import React, { use, useEffect, useState } from 'react'
import style from '../Styles/usersbar.module.css'
import {useChat} from '../context/ChatContext'

function UserBar({handleUserBarActive}) {

  const { fetchChannelUsers, state } = useChat()
  const { activeRoomUsers, activeChannel, selectedWorkspace} = state

  useEffect(()=>{
    console.log("Selected workspace: ", selectedWorkspace)
    fetchChannelUsers(activeChannel.id, activeChannel.is_private, selectedWorkspace.id)
  }, [])

  return (
    <div className={style.usersBarContainer} >
        
    </div>
  )
}

export default UserBar