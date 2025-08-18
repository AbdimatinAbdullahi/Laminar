import React, { use, useEffect, useState } from 'react'
import style from '../Styles/usersbar.module.css'
import {useChat} from '../context/ChatContext'

function UserBar({handleUserBarActive}) {

  const [ channelUsers, setChannelUsers ] = useState([])
  const { fetchChannelUsers, state } = useChat()
  const {  activeChannel, selectedWorkspace } = state

  useEffect(()=>{

    async function loadUsers(){
      if(selectedWorkspace || activeChannel){
        const result = await fetchChannelUsers(
          activeChannel.id, 
          activeChannel.is_private,
          selectedWorkspace.id
        )
        setChannelUsers(result)
      } else{
        console.log("Error while fetching data")
      }
    }

    loadUsers()

  }, [selectedWorkspace, activeChannel ])


  useEffect(() => {
    console.log("Fetched channel users", channelUsers)
    
  }, [channelUsers])
  

  return (
    <div className={style.usersBarContainer} >

        <div className={style.channelHeader} >
            <h2>{activeChannel.name}</h2>
            <span> {channelUsers.length} Members </span>
        </div>

        <div className={style.usersContainer} >

          {
            channelUsers.length > 0 ? (
              channelUsers.map((user) =>(
                <div key={user.id} className={style.singleUsers} >
                  <div className={style.iconS}> {user.fullname.slice(0, 1)} </div>
                  <h2>{user.fullname}</h2>
                </div>
              ))
            ) :(
              <div>
                <h2>No users found</h2>
              </div>
            )
          }

        </div>

    </div>
  )
}

export default UserBar