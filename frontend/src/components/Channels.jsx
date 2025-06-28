import React, { useState } from 'react'
import style from '../Styles/channel.module.css'
import { ChevronDown, Plus, Settings } from 'lucide-react';


import { useNavigate } from 'react-router';


function Channels({ data, dispatch }) {

  const {selectedWorkspace, channels} = data
  const navigate = useNavigate()

  if(!selectedWorkspace){
    return <div>Select a workspace</div>;
  }

  const filteredChannels = channels.filter((channel) => channel.workspace_id === selectedWorkspace.id)

  const handleChannelClick = (channel)=>{
    dispatch({type: "SELECT_CHANNEL", payload: channel})
  }


  return (
    <div className={style.channelContainer}>

      {/* Selected Workspace */}
      <div className={style.workspaceDetails}>
        <div onClick={()=> navigate(`/setting/${selectedWorkspace.id}`)} >
          {selectedWorkspace.name}
        </div>
        <ChevronDown className={style.Icon} size={50} />
      </div>


      {/* Channel Headers */}
      <div className={style.channelHeader}>
        <div>Channels</div>
        <Plus className={style.Icon} />
      </div>

      {/* Channels */}
      <div className={style.channels}>
        {filteredChannels.map((channel) => (
          <div className={style.channel} onClick={() => handleChannelClick(channel)} >
            # {channel.name}
          </div>
        ))}
      </div>


    </div>
  )
}

export default Channels