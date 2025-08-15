import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'
import { useChat } from '../context/ChatContext'

function WorkspaceCreateModal() {

  const [ newWorkspaceName, setnewWorkspaceName ] = useState("")

  const { handleCloseWorkspaceCreateModal, handleCreateWorkspace } = useChat()
  
  const handleCreate = async ()=>{
    if(newWorkspaceName === "") return
    const result = await handleCreateWorkspace(newWorkspaceName)
    if(result.success){
      handleCloseWorkspaceCreateModal()
    } else{
      alert("Failed to create workspace")
      handleCloseWorkspaceCreateModal()
    }
  }

  return (
    <div className={style.WorkspaceCreateModalOverlay}>
        <div className={style.WorkspaceCreateModalContainer}>
          <X className={style.closeIcon} onClick={handleCloseWorkspaceCreateModal} />
          <input type="text" placeholder='Enter workspace name' value={newWorkspaceName} onChange={(e) => setnewWorkspaceName(e.target.value)}/>
          <button onClick={handleCreate} >Create worspace</button>
        </div>
    </div>
  )
}

export default WorkspaceCreateModal