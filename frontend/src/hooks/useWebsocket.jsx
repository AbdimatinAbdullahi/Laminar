import { useEffect, useRef } from "react";

export const useWebsocket = (userID, onMessage) =>{
    const socketRef = useRef(null)

    useEffect(()=>{
        
        const socket = new WebSocket(`ws://localhost:8008/ws?userId=${userID}`)
        
        socketRef.current = socket

        socket.onmessage = (event) =>{
            const data = JSON.parse(event)
            if(data) onMessage(data)
        }

        return ()=>{
            if(socketRef.current){
                socketRef.current.close()
            }
        };

    }, [userID])


    const sendMessage = (message) =>{
        console.log(message)
        // if(socketRef.current && socketRef.current.readyState == WebSocket.OPEN){
        //     socketRef.current.send(JSON.stringify(message))
        // }
    }


    return {sendMessage}

}