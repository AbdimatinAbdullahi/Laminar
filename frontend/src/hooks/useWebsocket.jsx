import { act, useEffect, useRef } from "react";

export const useWebsocket = (userID, activeChannelID, onMessage, onReaction, onEdit, onDelete) =>{
    const socketRef = useRef(null)

    useEffect(()=>{

        if(!userID){
            console.warn("User Id is not available")
            return
        }
        
        const socket = new WebSocket(`ws://localhost:8008/ws?userId=${userID}`)
        
        socketRef.current = socket

        socket.onmessage = (event) =>{
            const data = JSON.parse(event.data)
            const messageType = (data.type || data.Type || '').toLowerCase();
            switch(messageType){
                case "message":
                    onMessage(data)
                    break
                case "reaction":
                    onReaction(data)
                    break
                case "edit_message":
                    onEdit(data)
                case "delete_message":
                    onDelete(data)

            }
        }

        
        socket.onopen = () =>{
            console.log("Websocket is open!")
            if(activeChannelID != ""){
                socket.send(JSON.stringify({
                    type: "join",
                    data: {
                        channelID: activeChannelID,
                        userID: userID
                    }
                }))
            }
        }

        socket.onerror = (err)=>{
            console.error("Error connecting to websocket", err)
        }

        socket.onclose = ()=>{
            console.error("Socket closed!")
        }

        return ()=>{
            if(socketRef.current){
                socketRef.current.close()
            }
        };

    }, [userID, activeChannelID])


    const sendMessage = (message) =>{
        if(socketRef.current && socketRef.current.readyState == WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(message))
        } else{
            console.warn("Failed to send data via websockets!")
        }
    }


    const sendReaction = (reactionEmoji, reactorId, msgId) =>{
        console.log(`Reaction details: ${reactionEmoji}, ${reactorId} and ${msgId}`)
        if(socketRef.current && socketRef.current.readyState == WebSocket.OPEN){
            socketRef.current.send(JSON.stringify({
                type: "reaction",
                payload:{
                    "messageId": msgId,
                    "reactorId" : reactorId,
                    "emoji" : reactionEmoji
                }
            }))
        } else{
            console.warn("Reaction is not!")
        }
    }

    const sendEditMessage = (newData) =>{
        console.log("The content of new message: ", newData);
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(newData))
        } else{
            console.warn("Problem sending the new data to backend")
        }
    }

    const sendDeleteMessage = (data) =>{
        console.log("Sending the delete data: ", data)
        if(socketRef.current && socketRef.current.readyState == WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(data))
        } else {
            console.warn("Delete data not sent")
        }
    }


    return {sendMessage, sendReaction, sendEditMessage, sendDeleteMessage}

}