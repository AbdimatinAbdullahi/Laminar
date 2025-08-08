import React, { use } from 'react'
import { useNavigate } from 'react-router'
import style from '../Styles/chatroom.module.css'
import { Plus, Settings } from 'lucide-react'
import {useAuth} from '../context/AuthContext'
import { useChat } from '../context/ChatContext'


function Sidebar({ state, dispatch, setUserbarActive }) {
  
  const navigate = useNavigate()
  const {user, logout} = useAuth()
  const {workspaces, channels, selectedWorkspace} = state
  const {, openCreateChannelModal, workspaceCreateModalOpen } = useChat()
  
  function handleWorkspaceSelect(ws){
    dispatch({type: "SELECT_WORKSPACE", payload: ws})
  }

  function handleActiveSelect(channel){
    setUserbarActive(false)
    dispatch({type: "SELECT_CHANNEL", payload: channel})
    console.log(channel)
  }

  const filteredChannels = channels.filter((channel) => channel.workspace_id === selectedWorkspace.id)

  return (
    <div className={style.sidebarContainer}>

      <div className={style.workspacesContainer}>
          {workspaces.map((workspace)=>(
            <div className={style.workspace} key={workspace.id} onClick={()=> handleWorkspaceSelect(workspace)} >
              {workspace.name.charAt().slice(0, 3)}
            </div>
          ))}
          <div className={style.addWorkspace} onClick={()=>} >
            <Plus style={{backgroundColor: "inherit"}} size={30} />
          </div>
      </div>

      <div className={style.workspaceDetail}>

        {/* Workspace Header => onclick workspace page */}
        <div className={style.workspaceHeader} onClick={()=>navigate(`/setting/${selectedWorkspace.id}`)} >
            <Settings className={style.icon}  size={30}/>
            <h3>{selectedWorkspace?.name || "Workspace"}</h3>
        </div>

        
        {/* Workspace channels */}
        <div className={style.channelsContainer}>
          <div className={style.channelHeader}>
            <h4>Channels</h4>
            <Plus className={style.channelAddIcon} onClick={() =>openCreateChannelModal()} />
          </div>

          <div className={style.channels}>
            {filteredChannels.map((channel)=>(
              <div key={channel.id} onClick={()=> handleActiveSelect(channel)} >{channel.name}</div>
            ))}
          </div>
        </div>


        {/* User profile and showing details */}
        <div className={style.userProfile}>
              <div className={style.profileIcon}>
                  {user.fullname.slice(0,1)}
              </div>

              <div className={style.userNameAndEmail}>
                  <span className={style.spanWithFullname} >{user.fullname}</span>
                  <span className={style.spanWithStatus} >Online</span>
              </div>

              <div className={style.settingIconButton} onClick={logout} >
                  <Settings color='#FF00C8' />
              </div>
        </div>



      </div>

    </div>
  )
}

export default Sidebar