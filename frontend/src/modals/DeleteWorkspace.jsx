import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'
import { useAdminContext } from '../context/AdminContext'
import { useAuth } from '../context/AuthContext'

function DeleteWorkspace({ onClose }) {

  const { user } = useAuth()
  const { deleteWorkspace } = useAdminContext()
  const [loading, setLoading] = useState(false)
  const [deleteError, setdeleteError] = useState("")

  async function handleDeleteWorkspace(){
    setLoading(true)
    const userId = user.id
    console.log(user)
    const result = await deleteWorkspace(userId)

    setLoading(false)
  }


  return (
    <div className={style.modalOverlay} >
        <div className={style.deleteModalContainer}>
          {deleteError != "" && (
            <div className={style.errorDisplay} > 
                <div className={style.errorMessage} ></div>
                <X onClick={()=>setdeleteError("")} />
            </div>
          )}
          {!loading && <X className={style.Icon} size={40} onClick={onClose} />}
            <div className={style.deleteTextContent}>
              <h2>Only the workspace creator can delete this workspace.</h2>
              <p>This action is permanent and will remove all messages, members, and data.</p>
              <button 
                onClick={handleDeleteWorkspace} 
                style={loading ? {backgroundColor: "gray"} : {backgroundColor: "red"}}
              > {loading ? "Deleting ...." : "Are sure you want to delete?"} </button>
            </div>
        </div>
    </div>
  )
}

export default DeleteWorkspace