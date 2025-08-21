import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'
import { useChat } from '../context/ChatContext'

function WorkspaceCreateModal() {

  const [loading, setLoading] = useState(false)
  const [invitedToken, setinvitedToken] = useState("")
  const [ newWorkspaceName, setnewWorkspaceName ] = useState("")
  const [createWorkspaceError, setCreateWorkspaceError] = useState("Something went wrong while creating workspace")

  const { handleCloseWorkspaceCreateModal, handleCreateWorkspace } = useChat()
  
  const handleCreate = async ()=>{
    if(newWorkspaceName === "") return
    const result = await handleCreateWorkspace(newWorkspaceName)
    if(result.success){
      handleCloseWorkspaceCreateModal()
    } else{
      setCreateWorkspaceError("Something went wrong while creating workspace")
      alert("Failed to create workspace")
      handleCloseWorkspaceCreateModal()
    }
  }

  const handleAcceptInvitation = async ()=>{
    
  }

  return (
    <div className={style.WorkspaceCreateModalOverlay}>
        <div className={style.WorkspaceCreateModalContainer}>
          <X className={style.closeIcon} onClick={handleCloseWorkspaceCreateModal} />
          
          {createWorkspaceError != "" && (
            <div className={style.createWorkspaceError}>
              <span> {createWorkspaceError} </span>
              <X onClick={()=>setCreateWorkspaceError("")} color='red' />
            </div>
          )}

          <div className={style.ownWorkspace}> 
              <span> Create Workspace </span>
              <input type="text" placeholder='Enter workspace name' value={newWorkspaceName} onChange={(e) => setnewWorkspaceName(e.target.value)}/>
              <button onClick={handleCreate} >Create worspace</button>
          </div>
            <div className={style.Or} />
          <div className={style.invitedContainer}>
            <span> Paste the invited code </span>
              <input type="text" value={invitedToken} onChange={(e)=>setinvitedToken(e.target.value)} placeholder='Paste the token here' />
              <button onClick={handleAcceptInvitation} > Accept invitation </button>
          </div>

        </div>
    </div>
  )
}

export default WorkspaceCreateModal