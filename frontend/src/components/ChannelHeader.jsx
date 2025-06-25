import React from 'react'
import style from '../Styles/chatwindow.module.css'
import {Phone, Users, Video} from  "lucide-react"

function ChannelHeader() {
  return (
    <div className={style.channelHeaderContainer} >

        <div className={style.channelNameDisplayer}>
            <h2># HR community </h2>
            <p> Private </p>
        </div>

        <div className={style.meetingService}>
            <Phone size={70} className={style.meetingIcons}  />
            <Video size={70} className={style.meetingIcons}  />
            <Users size={70}  className={style.meetingIcons}  />
        </div>
    </div>
  )
}

export default ChannelHeader