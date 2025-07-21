import { act, useEffect, useRef } from "react";

export const useWebsocket = (userID, activeChannelID, onMessage) =>{
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
            switch(data.type){
                case "message":
                    onMessage(data)
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
        console.log(socketRef.current.readyState)
        if(socketRef.current && socketRef.current.readyState == WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(message))
        } else{
            console.warn("Failed to send data via websockets!")
        }
    }


    return {sendMessage}

}