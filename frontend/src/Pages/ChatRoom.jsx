import React, {useState, useEffect} from 'react'
import style from '../Styles/chatroom.module.css'

function ChatRoom() {

    // We take the access token from user object and send it to workspace service to fetch workspace data that user belongs to. Workspace > Channels and Messages ( A lot of messages and some times millions). And be aware that there is chat Context and chat reducer that I nned to understand

  return (
    <div className={style.appLayout}>
        {/* Left Sidebar */}

        {/* Chat Window */}

        {/* Right Sidebar */}
    </div>
  )
}

export default ChatRoom