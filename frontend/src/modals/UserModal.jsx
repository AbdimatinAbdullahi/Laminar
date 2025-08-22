import React, { useEffect } from 'react'
import style from '../Styles/modals.module.css'
import { User, X, SquareArrowOutUpRight } from 'lucide-react'
import { useAdminContext } from '../context/AdminContext'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function UserModal({onClose, user}) {

  const { user } = useAuth()
  const { deleteUser } = useAdminContext()
  const [loadingUpdate, setloadingUpdate] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  async function handleDeleteUser(){
    setLoadingDelete(true)
    const result = await deleteUser(user.User.Email)
    if(result.success){
      setLoadingDelete(false)
      onClose()
    } else{
      setLoadingDelete(false)
      setDeleteError("Error while deleting user from workspace")
    }
  }


  async function handleRoleUpdate(){
    
    try {
      const updateRoleRs = await axios.patch(`http://localhost:8008/update-role`, { admin: user.id, member: user.User.Email  })
      if(updateRoleRs.status == 200){

      }
    } catch (error) {
      
    }
  }

  return (
    <div className={style.modalOverlay} >
        <div className={style.modalUserContainer}>

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
                  <h4>{user.User.Name}</h4>
                </div>
                <div className={style.email}>
                  <h2>Email</h2>
                  <h4>{user.User.Email}</h4>  
                </div>
                <div className={style.role}>
                  <h2>Role</h2>
                  <select>
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
            </div>
          </div>
          <div className={style.actionButtons}>
            <button>Save Changes</button>
            <button style={ loadingDelete ? {backgroundColor: "gray"} : {backgroundColor: "#be123c"}} onClick={handleDeleteUser} disabled={loadingDelete}  >Delete User <SquareArrowOutUpRight style={{backgroundColor: "inherit"}}  size={30}/>  </button>
          </div>
        </div>
    </div>
  )
}

export default UserModal