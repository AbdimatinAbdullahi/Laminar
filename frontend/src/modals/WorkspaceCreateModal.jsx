import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'

function WorkspaceCreateModal() {

  const { user } = useAuth()
  const navigate = useNavigate()
  const [ loading, setLoading] = useState(false)
  const [ invitedToken, setinvitedToken] = useState("")
  const [ newWorkspaceName, setnewWorkspaceName ] = useState("")
  const [ createWorkspaceError, setCreateWorkspaceError] = useState("")
  const [ joinedSuccess, setJoinedSuccess ] = useState("")

  const { handleCloseWorkspaceCreateModal, handleCreateWorkspace } = useChat()
  
  const handleCreate = async ()=>{
    if(newWorkspaceName === "") return
    const result = await handleCreateWorkspace(newWorkspaceName)
    if(result.success){
      handleCloseWorkspaceCreateModal()
    } else{
      setCreateWorkspaceError("Something went wrong while creating workspace")
    }
  }

  const handleAcceptInvitation = async (invitationCode)=>{
    const token = invitationCode.trim()
    console.log("Token: ", token)
    if(token == "") {
      setCreateWorkspaceError("Provide the code that was sent to your email")
      return
    }
    setCreateWorkspaceError("")
    setLoading(true)
    try {
      const acceptResponse = await axios.post(`http://localhost:8008/join-workspace` , { email: user.email, token: token})
      if(acceptResponse.status == 200){
        setJoinedSuccess("Youve joined workspace")
        setTimeout(()=>{
          handleCloseWorkspaceCreateModal()
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      if(error.status == 403){
        setCreateWorkspaceError(error.response.data)
        console.log(error)
        
      } else if (error.status == 401) {
        setCreateWorkspaceError("An authorized login or expired token")
      } else {
        setCreateWorkspaceError("Something went wrong while accepting invitation")
      }
    } finally{
      setLoading(false)
    }
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

          { joinedSuccess != "" && (
            <div className={style.joinedSuccess}>
              <span>{joinedSuccess}</span>
              <X onClick={()=>setJoinedSuccess("")} /> 
            </div>
          )}

          <div className={style.ownWorkspace}> 
              <span> Create Workspace </span>
              <input type="text" placeholder='Enter workspace name' value={newWorkspaceName} onChange={(e) => setnewWorkspaceName(e.target.value)}/>
              <button onClick={handleCreate} style={ loading ? { backgroundColor: "gray" }: {} } disabled={loading} >Create worspace</button>
          </div>
            <div className={style.Or} />
          <div className={style.invitedContainer}>
            <span> Paste the invited code </span>
              <input type="text" value={invitedToken} onChange={(e)=>setinvitedToken(e.target.value)} placeholder='Paste the token here' />
              <button onClick={() => handleAcceptInvitation(invitedToken)} style={ loading ? { backgroundColor: "gray" }: {} } disabled={loading}> Accept invitation </button>
          </div>

        </div>
    </div>
  )
}

export default WorkspaceCreateModal