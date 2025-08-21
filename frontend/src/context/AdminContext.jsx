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

            dispatch({type: "LOAD_START"})

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
                    params: {wsId: workspaceId}
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
                dispatch({type: "LOAD_START"})
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
            } finally {
                dispatch({type: "LOAD_END"})
            }
        }


        // Only for creator of workspace
        const deleteWorkspace = async (userId)=>{
            console.log("User id", userId)
            try {
                dispatch({type: "LOAD_START"})
                const dlRs = await axios.delete("http://localhost:8008/delete-workspace", {
                    params: {
                        userId: userId, 
                        workspaceId: workspaceId
                    }
                })
                
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
                        console.log(inviteRes.data)
                        return {success: true}
                    }
                } catch (error) {
                    console.error("Invite user error: ", error)
                    return {success : false}
                }
            }


    return (
        <AdminContext.Provider value={{ state, dispatch, deleteWorkspace, leaveWorkspace,  InviteUser}}  >
            {children}
        </AdminContext.Provider>
    )
}


export const useAdminContext = () => useContext(AdminContext)