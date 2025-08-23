import React, {useReducer, useContext, useEffect, createContext} from "react";
import { useParams } from "react-router";
import axios from "axios";


const inititialState = {
    workspaceMemebers : [],
    workspaceCreator : null,
    workspaceData: null,
    invitations: [{Name: "Abdimatin Abdullahi", Email: "abdimatabdullahi@gmail.com", invitedAt: "2024-01-20"}, {Name: "Abdimatin Abdull", Email: "abdimatabdui@gmail.com", invitedAt: "2024-01-26"}],
    loading: false,
    // invitations: []
}


// Function that takes in current state and function and returns new state
const reducer = (state, action) =>{
    switch(action.type){
        case "LOAD_WORKSPACE_DATA":
            return {...state, workspaceData: action.payload.Workspace, workspaceCreator:action.payload.Creator, loading: false}
        case "LOAD_WORKSPACE_MEMBERS":
            return {...state, workspaceMemebers: action.payload, loading:false}

        case "LOAD_START":
            return {...state, loading: true}

        case "LOAD_END":
            return {...state, loading : false}

        case "REMOVE_USER_FROM_WORKSPACE":
             const email = action.payload
             const updatedMembers = state.workspaceMemebers.filter((member) => member.User.Email != email)
             console.log("Updated members: ", updatedMembers)
             return {...state, workspaceMemebers: updatedMembers}
        
        case "UPDATE_ROLE":
            console.log("Update user payload: ", action.payload)

        default:
            return state
    }
}


const AdminContext = createContext()

export const AdminProvider = ({children}) =>{

    // state, dispatch
    const [state, dispatch] = useReducer(reducer, inititialState)
    const { workspaceId } = useParams()


    useEffect(()=>{
        // Fetch workspace data: And we can change the name of workspace here also main
        const fetchWorkspaceData = async()=>{

            try {

                const wsResponse = await axios.get("http://localhost:8008/workspace-data",
                    { params:  { wsId : workspaceId } }
                    )

                if(wsResponse.status == 200){
                    console.log(wsResponse.data)
                    dispatch({ type: "LOAD_WORKSPACE_DATA", payload: wsResponse.data })
                }

            } catch (error) {
                console.error("Error fetching workspace data", error)
            }
        }


        // Fettching workspace Mmebrs here know!
        const fetchWorkspaceMembers = async () =>{
            try {

                dispatch({type: "LOAD_START"})

                const memebersRs = await axios.get('http://localhost:8008/workspace-members',  {
                    params: { wsId: workspaceId }
                })

                if(memebersRs.status == 200){
                    console.log(memebersRs.data)
                    dispatch({type: "LOAD_WORKSPACE_MEMBERS", payload:memebersRs.data, loading:false})
                }

            } catch (error) {
                console.error("Error fetching workspace members :" , error)
            }
        }

        fetchWorkspaceData()
        fetchWorkspaceMembers()
    }, [workspaceId])


    // Those without and creator privilieges only leaveing the workspace
        const leaveWorkspace = async (userId) => {
            try {
                const lvRs = await axios.delete("http://localhost:8008/leave-workspace", {
                    params: 
                    {
                        userId: userId,
                        workspaceId: workspaceId
                    }
                }
                )

                if(lvRs.status == 200){
                    dispatch({type: "LOAD_END"})
                }

            } catch (error) {
                console.error("Failed leaving workspace: ", error)
            }
        }


        // Only for creator of workspace
        const deleteWorkspace = async (userId)=>{
            console.log("User id", userId)
            try {
                const dlRs = await axios.delete("http://localhost:8008/delete-workspace", {
                    params: {
                        userId: userId, 
                        workspaceId: workspaceId
                    }
                })
                console.log(dlRs.status)
                

                if(dlRs.status == 200){
                    return {success : true}
                } 
                return {success : false}

            } catch (error) {
                console.error("Somethings happens while deleting workspace: ", error)
                return {success : false}
            }
        }


        async function InviteUser(email, role){
                try {
                    const inviteRes = await axios.post(`http://localhost:8008/invite-to-workspace`, 
                        { email: email, role: role, workspaceId: workspaceId }
                    )
                    if(inviteRes.status == 200){
                        // Add user to inviations
                        console.log(inviteRes.data)
                        return {success: true}
                    }
                } catch (error) {
                    console.error("Invite user error: ", error)
                    return {success : false}
                }
        }

        async function deleteUser(email){
            try {
                const deleteRes = await axios.delete(`http://localhost:8008/delete-user?email=${email}`)
                
                // const deleteRes = {
                //     status : 200
                // }

                if(deleteRes.status == 200){
                    dispatch({type: "REMOVE_USER_FROM_WORKSPACE", payload: email})
                    return {success : true}
                } else {
                    return {success: false}
                }
            } catch (error) {
                console.log("Error deleting user: ", error)
                return {success: false}
            }
        }

        
        async function updateRole(updatorID, email, role){
            try {

                 const updateRs = await axios.patch(`http://localhost:8008/update-role`,
                    { updatorID: updatorID, email:email, role:role, workspaceId: workspaceId }
                )

                if(updateRs.status == 200){
                    dispatch({type:"UPDATE_ROLE", payload: { email: email, role: role }}) //TODO
                    return {success: true}
                }
            } catch (error) {
                console.log(error)
                return { success: false }
            }
        }


    return (
        <AdminContext.Provider value={{ state, dispatch, deleteWorkspace, leaveWorkspace,  InviteUser, deleteUser, updateRole}}  >
            {children}
        </AdminContext.Provider>
    )
}


export const useAdminContext = () => useContext(AdminContext)