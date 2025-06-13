import React, {useState, useEffect} from 'react'
import style from '../Styles/chatroom.module.css'
import axios from 'axios';


import Chatwindow from '../components/Chatwindow';
import Sidebar from '../components/Sidebar';


function ChatRoom() {

    // We take the access token from user object and send it to workspace service to fetch workspace data that user belongs to. Workspace > Channels and Messages ( A lot of messages and some times millions). And be aware that there is chat Context and chat reducer that I nned to understand



  return (
    <div className={style.appLayout}>
        {/* Left Sidebar */}

        <Sidebar/>

        {/* Chat Window */}
        <Chatwindow/>

    </div>
  )
}

export default ChatRoom