import React, { use, useEffect, useState } from 'react'
import style from '../Styles/usersbar.module.css'
import {useChat} from '../context/ChatContext'

function UserBar({handleUserBarActive}) {

  const { fetchChannelUsers, state } = useChat()
  const { activeRoomUsers, activeChannel } = state

  useEffect(()=>{
    fetchChannelUsers(activeChannel.id)
  }, [])

  return (
    <div className={style.usersBarContainer} >
        
    </div>
  )
}

export default UserBar