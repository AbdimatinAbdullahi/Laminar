import React, {useReducer, useContext, createContext, useEffect, useState, act} from "react";
import axios from "axios";
import {useNavigate} from 'react-router'

const ChatContext = createContext()

// This context id used: getting user id and sending to backend
// Response: Workspaces, Channels and Each message channels limited to 50 for pagination later implement infinit scroll as user scrolls up
//Take default workspace as first


const initialState = {
    workspaces : [],
    channels : [],
    loading: false,
    error: null,
    selectedWorkspace: null
}


const reducer = (state, action)=>{
    switch(action.type){
        case "LOAD_START":
            return {...state, loading: true}
        
        case "LOAD_ENDS":
            // get the first response data which will be used to select the first workspace
            const first = action.payload.length > 0 ? action.payload[0].Workspace : null;
            return {...state, 
                loading:false, 
                workspaces:action.payload.map(item => item.Workspace), 
                channels:action.payload.flatMap(item => item.Channels),
                selectedWorkspace: first
            }
        
        case "LOAD_ERROR":
            return {...state, loading: false, error: action.payload}

        case "SELECT_WORKSPACE":
            return {...state, loading:false, selectedWorkspace:action.payload}
        
            default:
            return state
    }
}

export const ChatProvider = ({children})=>{
    const [state, dispatch] = useReducer(reducer, initialState)
    const navigate = useNavigate()
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
                dispatch({"type" : "LOAD_ENDS", payload: res.data})
                console.log(res.data)
            }

        } catch (error) {
            navigate('/')
            dispatch({type: "LOAD_ERROR", payload: error})
            console.error("Error fetching the data from backend: ", error)
        }
      }

      fetchWorkspaceData()
    }, [])


    useEffect(() => {
        console.log("Loaded data: ", state);
    }, [state]);


    return(
        <ChatContext.Provider value={{ state, dispatch }} >
            {children}
        </ChatContext.Provider>
    )

}

export const useChat = ()=> useContext(ChatContext)