import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { X, UsersRound } from 'lucide-react'
import { useAdminContext } from '../context/AdminContext'


function Invite( { onClose } ) {

  const [role, setRole] = useState("Member")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inviteError, setinviteError] = useState("")
  const { InviteUser } = useAdminContext()

  async function handleInvite(){
    if(email == "" || role == ""){
      setinviteError("Provide both email and role in right format")
      return
    }

    setLoading(true)
    setinviteError("")

    setTimeout(async ()=>{
      const result = await InviteUser(email, role)
      setLoading(false)
      if(!result.success){
        setinviteError("something went wrong while processing invitation")
      } else{
        onClose()
      }
    }, 5000);
    }
  


  return (
    <div className={style.modalOverlay}>
      <div className={style.inviteContainer}>
          <X size={30} className={style.Icon} onClick={onClose}/>
          {inviteError != "" && ( 
            <div className={style.inviteError}>
              <span>{inviteError}</span>
              <X onClick={()=>setinviteError("")} color='red' />
            </div>
           )}
          <div className={style.inviteContent}>
              <UsersRound className={style.teamIcon} size={50}  />
              <div className={style.inviteText}>
                <h3>Invite a member to your team by inviting them directly using email</h3>
                <div className={style.inputEmail}>
                  <input type="email" placeholder='Enter the email' value={email} onChange={(e)=> setEmail(e.target.value)}/>
                  <select className={style.selectDiv} value={role} onChange={(e) => setRole(e.target.value)} >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <button onClick={handleInvite} style={ loading ? { backgroundColor: "gray", color: "white" } : {} }  >{ loading ? "Processing" : "Invite"}</button>
          </div>
      </div>
    </div>
  )
}

export default Invite