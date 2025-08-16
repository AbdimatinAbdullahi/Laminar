 import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { useChat } from '../context/ChatContext'
import { X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function AddUserModal({onClose}) {


    const { user } = useAuth()
    const { state } = useChat()
    const [ loading, setLoading ] = useState(false)
    const [ workspaceUsers, setWorkspaceUsers ] = useState([])
    const [ selectedUser, setselectedUser ] = useState("")
    const [ addUserError, setAddUserError ] = useState("")

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
        if(selectedUser == "" && !state.activeChannel.id) return;
        try {
            console.log("User id", selectedUser)
            console.log("channel id", state.activeChannel.id)
            const addUserRs = await axios.post(`http://localhost:8008/add-user-to-channel`,
                 { userId: selectedUser, channelId: state.activeChannel.id, workspaceId: state.selectedWorkspace.id },
                {headers: {
                    "Authorization": `Bearer ${user.token}`
                }}
                )
            if(addUserRs.status == 200){
                onClose()
            }
        } catch (error) {
            if(error.response?.status == 403){
                setAddUserError("you dont have permission to add member to the channel")
            } else if(error.response?.status == 409){
                setAddUserError("user already exist")
            } else {
                setAddUserError("Internal server error")
            }
        }
    }



  return (
    <div className={style.AddUserModalOverlay} >
        <div className={style.addModalUserContainer}>
            <X onClick={onClose} className={style.closeIcon} />
            <h3>Add user to {state.activeChannel?.name}</h3>

            {addUserError != "" && ( 
                <div className={style.addUserError} >
                    <span>{addUserError}</span>
                    <X size={30} className={style.closeIconTwo} onClick={()=>setAddUserError("")}/>
                </div> 
            )}

            <div className={style.selectContainer} onFocus={handleFetchUsers}>
                <select value={selectedUser} onChange={(e)=>setselectedUser(e.target.value)} >
                    {workspaceUsers.map((user)=>(
                        <option value={user.id}>
                            {user.fullname} {user.email}
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