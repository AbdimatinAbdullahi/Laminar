import React from 'react'
import style from '../Styles/modals.module.css'

function Leaveworkspace({onClose}) {
  return (
    <div className={style.modalOverlay}>

        <div className={style.leaveContainer}>

            <div className={style.LeaveWorskpaceTexts}>
                <h2>Are you sure you want to leave Acme Inc?</h2>
                <p>You’ll lose access to all channels, messages, and files in this workspace.
                This action is immediate and cannot be undone, until the admin readds you to workspace</p>
            </div>
            
            <div className={style.leaveButton}>
                <button>Leave workspace</button>
                <button onClick={onClose} style={{backgroundColor: "#5a67d8"}} >Cancel</button>
            </div>
        </div>

    </div>
  )
}

export default Leaveworkspace