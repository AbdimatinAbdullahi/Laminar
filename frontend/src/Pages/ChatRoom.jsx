import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router'
import style from '../Styles/chatroom.module.css'
import axios from 'axios';

function ChatRoom() {

    // We take the access token from user object and send it to workspace service to fetch workspace data that user belongs to. Workspace > Channels and Messages ( A lot of messages and some times millions). And be aware that there is chat Context and chat reducer that I nned to understand

    const navigate = useNavigate();

    useEffect(()=>{
      const fetchWorkspaceData = async () => {
        try {
            const token = localStorage.getItem("lam")

            if(!token){
              navigate('/')
              return
            }
            
            const res = await axios.get("http://localhost:8008/workspace", {
                headers: {
                  "Authorization" : `Bearer ${token}`
                }              
            })
            if(res.status == 200){
              console.log(res.data)
            }

        } catch (error) {
            console.error("Error fetching the data from backend: ", error)
        }
      }

      fetchWorkspaceData()

    }, [])

  return (
    <div className={style.appLayout}>
        {/* Left Sidebar */}

        {/* Chat Window */}

        {/* Right Sidebar */}
    </div>
  )
}

export default ChatRoom