import { act, useEffect, useRef } from "react";

export const useWebsocket = (userID, activeChannelID, onMessage, onReaction, onEdit) =>{
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
            console.log("Data from websocket: ", data)
            const messageType = (data.type || data.Type || '').toLowerCase();
            console.log("Message Type: ", messageType)
            switch(messageType){
                case "message":
                    console.log("Incoming message data: ", data)
                    onMessage(data)
                    break
                case "reaction":
                    onReaction(data)
                    break
                case "edit_message":
                    onEdit(data)

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
        console.log(message)
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
                data:{
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


    return {sendMessage, sendReaction, sendEditMessage}

}