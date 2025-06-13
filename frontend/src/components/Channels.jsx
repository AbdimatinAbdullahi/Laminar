import React from 'react'
import style from '../Styles/channel.module.css'

function Channels({ data }) {

  const {selectedWorkspace, channels} = data

  if(!selectedWorkspace){
    return <div>Select a workspace</div>;
  }

  const filteredChannels = channels.filter((channel) => channel.workspace_id === selectedWorkspace.id)

  return (
    <div className={style.channelContainer}>

      <div className={style.workspaceDetails}> {selectedWorkspace.name} </div>

      {filteredChannels.map((channel) => (
        <div className={style.channels} >
          {channel.name}
        </div>
      ))}
    </div>
  )
}

export default Channels