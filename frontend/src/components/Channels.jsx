import React from 'react'
import style from '../Styles/channel.module.css'
import { ChevronDown, Plus, Settings } from 'lucide-react';

function Channels({ data }) {

  const {selectedWorkspace, channels} = data

  if(!selectedWorkspace){
    return <div>Select a workspace</div>;
  }

  const filteredChannels = channels.filter((channel) => channel.workspace_id === selectedWorkspace.id)


  const handleClickWorkspace = () =>{
    console.log("Tool bar opened!")
  }


  return (
    <div className={style.channelContainer}>

      {/* Selected Workspace */}
      <div className={style.workspaceDetails}>
        <div>
          {selectedWorkspace.name}
        </div>
        <ChevronDown className={style.Icon} size={50} onClick={()=> handleClickWorkspace(selectedWorkspace)} />
      </div>

      {/* Channel Headers */}
      <div className={style.channelHeader}>
        <div>Channels</div>
        <Plus className={style.Icon} />
      </div>

      {/* Channels */}
      <div className={style.channels}>
        {filteredChannels.map((channel) => (
          <div className={style.channel} >
            # {channel.name}
          </div>
        ))}
      </div>


    </div>
  )
}

export default Channels