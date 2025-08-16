import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { useChat } from '../context/ChatContext'
import { X } from 'lucide-react'
import axios from 'axios'

function AddUserModal({onClose}) {

    const { state } = useChat()
    const [loading, setLoading] = useState(false)
    const [workspaceUsers, setWorkspaceUsers] = useState([])
    const [selectedUser, setselectedUser] = useState(null)
    const [addUserError, setAddUserError] = useState("")

    const handleFetchUsers = async ()=>{
        if(workspaceUsers.length > 0) return
        setLoading(true)
        try {  
        const wkspaceUsersRs = await axios.get(`http://localhost:8008/workspaceUsers?id=${state.selectedWorkspace.id}`)
        if(wkspaceUsersRs.status == 200){
            console.log(wkspaceUsersRs.data)
            setWorkspaceUsers(wkspaceUsersRs.data)
        }
        } catch (error) {
            console.error()
        }
        setLoading(false)
    }

    const addUserToTheChannel = async ()=>{
        if(selectedUser == null) return
        try {
            const addUserRs = await axios.post(`http://localhost:8008/add-user-to-channel`, { userId: selectedUser.id, channelId: state.activeChannel.Id})
            if(addUserRs.status == 200){
                onClose
            }
        } catch (error) {
            console.log(error)
        }
    }



  return (
    <div className={style.AddUserModalOverlay} >
        <div className={style.addModalUserContainer}>
            <X onClick={onClose} className={style.closeIcon} />
            <h3>Add user to {state.activeChannel?.name}</h3>
            <div className={style.selectContainer} onFocus={handleFetchUsers}>
                <select value={selectedUser} onChange={(e)=>setselectedUser(e.target.value)} >
                    {workspaceUsers.map((user)=>(
                        <option value={user.id}>
                            {user.fullname}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={addUserToTheChannel} > Add user to {state.activeChannel.name} </button>
        </div>
    </div>
  )
}




export default AddUserModal