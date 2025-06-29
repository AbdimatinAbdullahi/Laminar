import React from 'react'
import style from '../Styles/chatroom.module.css'
import { Plus, Settings } from 'lucide-react'


function Sidebar({ state, dispatch }) {

  const {workspaces, channels, loading, selectedWorkspace, activeChannel} = state


  function handleWorkspaceSelect(ws){
    dispatch({type: "SELECT_WORKSPACE", payload: ws})
  }

  function handleActiveSelect(channel){
    dispatch({type: "SELECT_CHANNEL", payload: channel})
  }

  const filteredChannels = channels.filter((channel) => channel.workspace_id === selectedWorkspace.id)

  return (
    <div className={style.sidebarContainer}>

      <div className={style.workspacesContainer}>
          {workspaces.map((workspace)=>(
            <div className={style.workspace} onClick={()=> handleWorkspaceSelect(workspace)} >
              {workspace.name.charAt().slice(0, 3)}
            </div>
          ))}
      </div>

      <div className={style.workspaceDetail}>

        <div className={style.workspaceHeader}>
            <Settings className={style.icon}  size={30}/>
            <h3>{selectedWorkspace?.name || "Workspace"}</h3>
        </div>

        <div className={style.channelsContainer}>
          <div className={style.channelHeader}>
            <h4>Channels</h4>
            <Plus className={style.channelAddIcon} />
          </div>

          <div className={style.channels}>
            {filteredChannels.map((channel)=>(
              <div onClick={()=> handleActiveSelect(channel)} >{channel.name}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Sidebar