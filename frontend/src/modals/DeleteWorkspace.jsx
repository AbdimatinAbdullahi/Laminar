import React from 'react'
import style from '../Styles/modals.module.css'
import { X } from 'lucide-react'

function DeleteWorkspace({ onClose }) {
  return (
    <div className={style.modalOverlay} >
        <div className={style.deleteModalContainer}>
          <X className={style.Icon} size={40} onClick={onClose} />
            <div className={style.deleteTextContent}>
              <h2>Only the workspace creator can delete this workspace.</h2>
              <p>This action is permanent and will remove all messages, members, and data.</p>
              <button>Are you sure you want to continue?</button>
            </div>
        </div>
    </div>
  )
}

export default DeleteWorkspace