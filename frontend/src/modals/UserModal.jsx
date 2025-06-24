import React, { useEffect } from 'react'
import style from '../Styles/modals.module.css'
import { User, X, SquareArrowOutUpRight } from 'lucide-react'

function UserModal({onClose, user}) {

  useEffect(()=>{
    console.log(user)
  }, [])

  return (
    <div className={style.modalOverlay} >
        <div className={style.modalUserContainer}>
          <X className={style.Icon} size={55} onClick={onClose} />
          <div className={style.userContent}>
            <div className={style.userIcon}>
                <User className={style.teamIcon} size={150} />
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
            <button style={{backgroundColor: "#be123c"}} >Delete User <SquareArrowOutUpRight style={{backgroundColor: "inherit"}}  size={30}/>  </button>
          </div>
        </div>
    </div>
  )
}

export default UserModal