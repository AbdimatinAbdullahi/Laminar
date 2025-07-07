import React, {useReducer, useContext, createContext, useEffect, useState, act} from "react";
import axios from "axios";
import {useNavigate} from 'react-router'
import messages from "../utils/messageSamples";

const ChatContext = createContext()

const initialState = {
    workspaces : [],
    channels : [],
    loading: false,
    error: null,
    selectedWorkspace: null,
    activeChannel: null,
    messages: [],
    messageCursor: null,
    hasMoreMessages: true
}


const reducer = (state, action)=>{
    switch(action.type){
        case "LOAD_START":
            return {...state, loading: true}
        
        case "LOAD_ERROR":
            return {...state, loading: false, error: action.payload}

        case "SELECT_WORKSPACE":
            return {...state, loading:false, selectedWorkspace:action.payload, activeChannel: null, messages: [], messageCursor: null, hasMoreMessages: true}
        
        case "SELECT_CHANNEL":
            return {...state, activeChannel: action.payload, messages: [], messageCursor: null, hasMoreMessages: true}
        
        case "CLEAR_MESSAGES":
            return {...state, messages: action.payload }
        
        case "LOAD_MESSAGES":
            return {...state, messages: action.payload.messages, hasMoreMessages: action.payload.hasMoreMessages, messageCursor: action.payload.messageCursor}
        
        case "APPEND_MESSAGES":
            return {...state, messages: [...action.payload.messages, ...state.messages], messageCursor: action.payload.messageCursor, hasMoreMessages: action.payload.hasMoreMessages }    
        
        case "LOAD_ENDS":
            return {...state, loading:false, workspaces:action.payload.workspaces, channels:action.payload.channels, selectedWorkspace: action.payload.selectedWorkspace}
        
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

                const data = res.data[0]
                dispatch({
                    "type" : "LOAD_ENDS", 
                    payload: {
                        workspaces: res.data.map(item => item.Workspace), 
                        channels: res.data.flatMap(item => item.Channels),
                        selectedWorkspace: data.Workspace
                    }
                })
            }

        } catch (error) {
            navigate('/')
            dispatch({type: "LOAD_ERROR", payload: error})
            console.error("Error fetching the data from backend: ", error)
        }
      }

      fetchWorkspaceData()
    }, [])

    async function fetchMessages(beforeCursor = null){
        if(!state.activeChannel) return
        const url = `http://localhost:8008/chat?chatId=${state.activeChannel.id}&type=channel${beforeCursor ? `&before=${beforeCursor}` : ""}`
        try {
            const mesRes = await axios.get(url)
            console.log("Message response: ", mesRes)
            const newMessages = (mesRes.data || []).reverse()
            dispatch({
                type: beforeCursor ? "APPEND_MESSAGES" : "LOAD_MESSAGES",
                payload: {
                    messages: newMessages, 
                    hasMoreMessages: newMessages.length >= 10, 
                    messageCursor: newMessages.length > 0 ? newMessages[0].timestamp : null
                }
            })
        } catch (error) {
            console.log("Error reading the data from messages: ", error)
        }
    }


    return(
        <ChatContext.Provider value={{ state, dispatch, fetchMessages }} >
            {children}
        </ChatContext.Provider>
    )

}

export const useChat = ()=> useContext(ChatContext)