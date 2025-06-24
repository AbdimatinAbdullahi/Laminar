import React from 'react'
import style from '../Styles/modals.module.css'
import { X, UsersRound } from 'lucide-react'


function Invite( { onClose } ) {
  return (
    <div className={style.modalOverlay}>
      <div className={style.inviteContainer}>
          <X size={55} className={style.Icon} onClick={onClose} strokeWidth={4} />
          <div className={style.inviteContent}>

              <UsersRound className={style.teamIcon} size={150}  />
              <div className={style.inviteText}>
                <h3>Invite a member to your team by inviting them directly using email</h3>
                <div className={style.inputEmail}>
                  <input type="email" placeholder='Enter the email' />
                  <select className={style.selectDiv}>
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <button>Invite</button>
          </div>
      </div>
    </div>
  )
}

export default Invite