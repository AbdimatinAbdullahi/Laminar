import React, {useReducer, useContext, useEffect, createContext} from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";


const inititialState = {
    workspaceMemebers : [],
    workspaceCreator : null,
    workspaceData: null,
    invitations: [],
    loading: false,
    // invitations: []
}

const chatURL = import.meta.env.VITE_CHAT_API_URL

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
             return {...state, workspaceMemebers: updatedMembers}
        
        case "UPDATE_ROLE":
            const { email: updatedEmail, role: newRole } = action.payload;
            const roleUpdatedMembers = state.workspaceMemebers.map(member => {
                if (member.User.Email === updatedEmail) {
                    return {
                        ...member, // Member has User with email and WorkaspaceInfo with role and joined time
                         WorkspaceInfo: {
                            ...member.WorkspaceInfo,
                            Role: newRole
                        } 
                    };
                }
                return member;
            });
            return { ...state, workspaceMembers: roleUpdatedMembers };
        
        case "ADD_TO_INVITATION":
            const newInviedMember = {
                Email: action.payload.email,
                invitedAt: action.payload.invited_at
            }
            
            return {...state, invitations: [...state.invitations, newInviedMember]}

        case "REMOVE_FROM_INVITATION":
            const updatedInvitations = state.invitations.filter((member)=> member.Email !== action.payload)
            return { ...state, invitations: updatedInvitations };



        default:
            return state
    }
}


const AdminContext = createContext()

export const AdminProvider = ({children}) =>{

    // state, dispatch
    const { workspaceId } = useParams()
    const [state, dispatch] = useReducer(reducer, inititialState)


    useEffect(()=>{
        // Fetch workspace data: And we can change the name of workspace here also main
        const fetchWorkspaceData = async()=>{

            try {

                const wsResponse = await axios.get(`${chatURL}/workspace-data`,
                    { params:  { wsId : workspaceId } }
                    )

                if(wsResponse.status == 200){
                    dispatch({ type: "LOAD_WORKSPACE_DATA", payload: wsResponse.data })
                }

            } catch (error) {
                return
            }

        }


        // Fettching workspace Mmebrs here know!
        const fetchWorkspaceMembers = async () =>{
            try {

                dispatch({type: "LOAD_START"})

                const memebersRs = await axios.get(`${chatURL}/workspace-members`,  {
                    params: { wsId: workspaceId }
                })

                if(memebersRs.status == 200){
                    console.log(memebersRs.data)
                    dispatch({type: "LOAD_WORKSPACE_MEMBERS", payload:memebersRs.data, loading:false})
                }

            } catch (error) {
            }
        }

        fetchWorkspaceData()
        fetchWorkspaceMembers()
    }, [workspaceId])


    // Those without and creator privilieges only leaveing the workspace
        const leaveWorkspace = async (userId) => {
            console.log("User Id leaving workspace", userId)
            try {
                const lvRs = await axios.delete(`${chatURL}/leave-workspace`, {
                    params: 
                    {
                        userId: userId,
                        workspaceId: workspaceId
                    }
                })

                if(lvRs.status == 200){
                    return { success: true, message: "Left successfully" }
                }

            } catch (error) {
                if(error?.status == 401){
                    return { success: false, message: "Youre the creator of workspace! You cant leave"}
                }
                return { success: false, message : "Something went wrong" }
            }
        }


        // Only for creator of workspace
        const deleteWorkspace = async (userId)=>{
            console.log("User id", userId)
            try {
                const dlRs = await axios.delete(`${chatURL}/delete-workspace`, {
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
                return {success : false}
            }
        }


        async function InviteUser(email, role){
                try {
                    const inviteRes = await axios.post(`${chatURL}/invite-to-workspace`, 
                        { email: email, role: role, workspaceId: workspaceId }
                    )
                    if(inviteRes.status == 200){
                        // Add user to inviations
                        dispatch({type: "ADD_TO_INVITATION", payload:inviteRes.data})
                        return {success: true}
                    }
                } catch (error) {
                    console.error("Invite user error: ", error)
                    return {success : false}
                }
        }

        async function deleteUser(email){
            try {
                const deleteRes = await axios.delete(`${chatURL}/delete-user?email=${email}`)

                if(deleteRes.status == 200){
                    dispatch({type: "REMOVE_USER_FROM_WORKSPACE", payload: email})
                    return {success : true}
                } else {
                    return {success: false}
                }
            } catch (error) {
                return {success: false}
            }
        }

        
        async function updateRole(updatorID, email, role){
            try {

                 const updateRs = await axios.post(`${chatURL}/update-role`,
                    { updatorID: updatorID, email:email, role:role, workspaceId: workspaceId }
                )

                if(updateRs.status == 200){
                    dispatch({type:"UPDATE_ROLE", payload: { email: email, role: role }}) //TODO
                    return {success: true}
                }
            } catch (error) {
                return { success: false }
            }
        }


        async function cancelInvite(email, cancelorID){
            try {
                const cnInviteRes = await axios.post(`${chatURL}/cancel-invite`, 
                    {workspaceId:workspaceId, email:email, cancelorID: cancelorID}
                 )

                 if(cnInviteRes.status == 200){
                    dispatch({type: "REMOVE_FROM_INVITATION", payload: email})
                    return { success: true }
                 }
                 return {success: false}
            } catch (error) {
                return {success: false}
            }
        }


    return (
        <AdminContext.Provider value={{ state, dispatch, deleteWorkspace, leaveWorkspace,  InviteUser, deleteUser, updateRole, cancelInvite}}  >
            {children}
        </AdminContext.Provider>
    )
}


export const useAdminContext = () => useContext(AdminContext)