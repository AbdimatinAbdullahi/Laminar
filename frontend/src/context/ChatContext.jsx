import React, {useReducer, useContext, createContext, useEffect, useState, act} from "react";
import axios from "axios";
import {useNavigate} from 'react-router'
import { useWebsocket } from "../hooks/useWebsocket";
import { useAuth } from "./AuthContext";

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
    hasMoreMessages: true,
    activeRoomUsers: []
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
        
        case "APPEND_FROM_SOCKET":
            return {...state, messages: [...state.messages, action.payload]}    

        case "LOAD_ENDS":
            return {...state, loading:false, workspaces:action.payload.workspaces, channels:action.payload.channels, selectedWorkspace: action.payload.selectedWorkspace}
        
        case "SET_USERS":
            return {...state, loading: false, channelUsersRes: action.payload}
        
        default:
            return state
    }
}

export const ChatProvider = ({children})=>{

    
    const [state, dispatch] = useReducer(reducer, initialState)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(()=>{

        const token = localStorage.getItem("lam")
        if(!token){
          return
        }

        const fetchWorkspaceData = async (token) => {
            dispatch({type: "LOAD_START"})

            try {
                console.log("Token sending: ", token)
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

      fetchWorkspaceData(token)
      
    }, []);



    async function fetchMessages(beforeCursor = null){
        if(!state.activeChannel) return
        const url = `http://localhost:8008/chat?chatId=${state.activeChannel.id}&type=channel${beforeCursor ? `&before=${beforeCursor}` : ""}`
        try {
            const mesRes = await axios.get(url)
            const newMessages = (mesRes.data || []).reverse() // reverse the messages so that it can be from oldest to newest: oldest will be at index 0
            console.log("Messag response: ", mesRes.data)
            dispatch({
                type: beforeCursor ? "APPEND_MESSAGES" : "LOAD_MESSAGES", // If there is cursor, dispatch "APPEND_MESSAGES"
                payload: {
                    messages: newMessages, 
                    hasMoreMessages: newMessages.length >= 10, // if there messages from last fetch is greater than 10 there is a possibility we have more messages from database, if the messages fetched is less that or zero, all messages have been fetched
                    messageCursor: newMessages.length > 0 ? newMessages[0].timestamp : null // we get the cursor from the beginning of that array messages since it is the oldest 
                }
            });
        } catch (error) {
            console.log("Error reading the data from messages: ", error)
        }
    };


    const fetchChannelUsers = async (roomId, isPrivate, selectedWorkspaceID) => {
        try {
            const channelUsersRes = await axios.get(`http://localhost:8008/users/workspace?spaceId=${selectedWorkspaceID}&${isPrivate ? `channelId=${roomId}`: ""}`);
            if(channelUsersRes.status == 200){
                console.log(channelUsersRes.data)
                dispatch({type: "SET_USERS", payload:channelUsersRes.data.users})
            }
        } catch (error) {
            console.log("Error while loading users", error)
        }
    }



    const handleIncomingMessage = (message) =>{
        dispatch({ type: "APPEND_FROM_SOCKET", payload: message.message })
    }

    const { sendMessage } = useWebsocket(user.id, handleIncomingMessage)




    return(
        <ChatContext.Provider value={{ state, dispatch, fetchMessages, sendMessage, fetchChannelUsers }} >
            {children}
        </ChatContext.Provider>
    )

}

export const useChat = ()=> useContext(ChatContext)