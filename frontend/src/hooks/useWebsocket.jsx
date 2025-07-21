import { act, useEffect, useRef } from "react";

export const useWebsocket = (userID, activeChannelID, onMessage, onReaction) =>{
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
            switch(data.type){
                case "message":
                    console.log("Incoming message data: ", data)
                    onMessage(data)
                    break
                case "reaction":
                    console.log("Incoming reaction data: ", data)
                    onReaction(data)
                    break

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


    return {sendMessage, sendReaction}

}