import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router'

function Leaveworkspace({onClose}) {
  
  const { user } = useAuth()
  const  navigate = useNavigate()
  const { leaveWorkspace } = useAdminContext()
  const [ loading, setLoading ] = useState(false)
  const [ errorMessage, setErrorMessage ] = useState("")
  const [ successMessage, setSuccessMessage ] = useState("")
  
  async function handleLeaveWorkspace(){
    setLoading(true)
    const result = await leaveWorkspace(user.id)
    if(result.success){
      setSuccessMessage(result.message)
      setLoading(false)
      setTimeout(()=>{
        onClose()
        navigate("/@me")
      }, 3000)
    } else {
      setErrorMessage(result.message)
      setLoading(false)
    }
  }

  return (
    <div className={style.modalOverlay}>

        <div className={style.leaveContainer}>

            {errorMessage != "" && (
              <div className={style.errorLeaveMessage}>
                <span>{errorMessage}</span>
                <X onClick={()=> setErrorMessage("")} />
              </div>
            )}

            {successMessage != "" && (
              <div className={style.succesLeaveMessage}>
                <span>{successMessage}</span>
                <X onClick={()=> setSuccessMessage("")} />
              </div>
            )}

            <X onClick={onClose}  className={style.Icon} />
            <div className={style.LeaveWorskpaceTexts}>
                <h2>Are you sure you want to leave Acme Inc?</h2>
                <p>You’ll lose access to all channels, messages, and files in this workspace.
                This action is immediate and cannot be undone, until the admin readds you to workspace</p>
            </div>
            
            <div className={style.leaveButton}>
                <button onClick={handleLeaveWorkspace} disabled={loading} style={ loading ? {"backgroundColor" : "gray"} : {} } > {loading ? "Processing" : "Leave workspace"} </button>
            </div>
        </div>

    </div>
  )
}

export default Leaveworkspace