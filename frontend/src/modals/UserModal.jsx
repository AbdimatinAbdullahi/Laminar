import React, { useEffect } from 'react'
import style from '../Styles/modals.module.css'
import { User, X, SquareArrowOutUpRight } from 'lucide-react'
import { useAdminContext } from '../context/AdminContext'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function UserModal({onClose, member}) {

  const { user } = useAuth()
  const [ deleteError, setDeleteError ] = useState("")
  const { deleteUser, updateRole } = useAdminContext()
  const [ loadingDelete, setLoadingDelete ] = useState(false)
  const [ roleUpdateSucess, setRoleUpdateSucess ] = useState("")
  const [ role, setRole ] = useState(member.WorkspaceInfo.Role.toLowerCase())

  async function handleDeleteUser(){
    setLoadingDelete(true)
    const result = await deleteUser(member.User.Email)
    if(result.success){
      setLoadingDelete(false)
      setRoleUpdateSucess("User deleted successfull")
      setTimeout(() => {
        onClose()
      }, 2000);
    } else{
      setLoadingDelete(false)
      setDeleteError("Error while deleting user from workspace")
    }
  }


  async function handleRoleUpdate(){
    if(member.WorkspaceInfo.Role == role) return

    console.log("Members role: ", member.WorkspaceInfo.Role)

    if(member.WorkspaceInfo.Role == "owner"){
      setDeleteError("You cannot change the owner's Role")
      return
    }

    const result = await updateRole(user.id, member.User.Email, role)
    if(result.success){
      setRoleUpdateSucess("Role updated successful")
      setTimeout(() => {
        onClose()
      }, 4000);
    } else{
      setDeleteError("Something went wrong while updating")
    }
  
  }

  return (
    <div className={style.modalOverlay} >
        <div className={style.modalUserContainer}>

          {
            roleUpdateSucess != "" && (
              <div className={style.roleUpdateSucess}>
                <span> {roleUpdateSucess} </span>
                <X onClick={()=>setRoleUpdateSucess("")} color='green' />
              </div>
            )
          }

          {deleteError != "" && (
            <div className={style.deleteUserError}>
              <span> {deleteError} </span>
              <X onClick={()=>setDeleteError("")} color='red'/>
            </div>
          )}

          <X className={style.Icon} size={55} onClick={onClose} />
          <div className={style.userContent}>
            <div className={style.userIcon}>
                <User className={style.teamIcon} size={50} />
            </div>
            <div className={style.details}>
                <div className={style.name}>
                  <h2>Name</h2>
                  <h4>{member.User.Name}</h4>
                </div>
                <div className={style.email}>
                  <h2>Email</h2>
                  <h4>{member.User.Email}</h4>  
                </div>
                <div className={style.role}>
                  <h2>Role</h2>
                  <select value={role} onChange={(e)=>setRole(e.target.value)} >
                      {["admin", "member", "owner"].map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                  </select>
                </div>
            </div>
          </div>
          <div className={style.actionButtons}>
            <button onClick={handleRoleUpdate} >Save Changes</button>
            <button style={ loadingDelete ? {backgroundColor: "gray"} : {backgroundColor: "#be123c"}} onClick={handleDeleteUser} disabled={loadingDelete}  >Delete User <SquareArrowOutUpRight style={{backgroundColor: "inherit"}}  size={30}/>  </button>
          </div>
        </div>
    </div>
  )
}

export default UserModal