import React from 'react'
import style from '../Styles/chatwindow.module.css'


import ChannelHeader from './ChannelHeader'
import Conversation from './Conversation'
import ChatComposer from './ChatComposer'

function Chatwindow() {

  const [showUsersBar, setshowUsersBar] = useState(false)


  return (
    <div className={style.chatContainer}>
      <ChannelHeader/>
      <Conversation/>
      <ChatComposer/>
    </div>
  )
}

export default Chatwindow