import React, {useReducer, useContext, createContext, useEffect, useState, act} from "react";
import axios from "axios";




const ChatContext = createContext()


// This context id used: getting user id and sending to backend
// Response: Workspaces, Channels and Each message channels limited to 50 for pagination later implement infinit scroll as user scrolls up
//Take default workspace as first




const initialState = {
    workspace : [],
    channels : [],
    messages: [],
    selectedWorkspace: null,
    loading: false,
    error: null
}


const reducer = (state, action)=>{
    switch(action.type){
        case "LOAD_START":
            return {...state, loading: true}
        
        case "LOAD_ENDS":
            return {...state, loading:false, workspace:action.payload.workspace, channels: action.payload.channels, messages: action.payload.messages, selectedWorkspace: action.payload[0] || null}
        
        case "LOAD_ERROR":
            return {...state, loading: false, error: action.payload}
        default:
            return state
    }
}

export const ChatProvider = ({children})=>{
    const [state, dispatch] = useReducer(reducer, initialState)
    
    useEffect(()=>{
      const fetchWorkspaceData = async () => {
        dispatch({type: "LOAD_START"})
        try {
            const token = localStorage.getItem("lam")

            if(!token){
              navigate('/')
              return
            }
            
            const res = await axios.get("http://localhost:8008/workspace", {
                headers: {
                  "Authorization" : `Bearer ${token}`
                }              
            })
            if(res.status == 200){
                dispatch({type: "LOAD_ENDS", payload: res.data})
                console.log(res.data)
            }

        } catch (error) {
            dispatch({type: "LOAD_ERROR", })
            console.error("Error fetching the data from backend: ", error)
        }
      }

      fetchWorkspaceData()
    }, [])


    return(
        <ChatContext.Provider value={{ state, dispatch }} >
            {children}
        </ChatContext.Provider>
    )

}

export const useChat = ()=> useContext(ChatContext)