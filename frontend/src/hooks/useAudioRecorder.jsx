import { useState, useRef } from "react";

export const useAudioRecorder = ()=>{

    const [audioUrl, setaudioUrl] = useState(null)
    const [isRecording, setisRecording] = useState(false)
    const mediaRecordRef = useRef(null)
    const audioChunksRef = useRef([])


    const startRecording = async ()=>{
        
        const stream = navigator.mediaDevices.getUserMedia({audio: true})
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecordRef.current = mediaRecorder;
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) =>{
            if(e.data.size > 0) {
                audioChunksRef.current.push(e.data)
            }
        };

        mediaRecorder.onstop = ()=>{
            const audioBlob = new Blob(audioChunksRef.current, {type: "audio/webm"});
            const audioUrl = URL.createObjectURL(audioBlob)
            setaudioUrl(audioUrl)
        };

        mediaRecorder.start()
        setisRecording(true)
    }

    const stopRecording = ()=>{
        mediaRecordRef.current?.stop();
        setisRecording(false)
    }


    return {isRecording, audioUrl, startRecording, stopRecording, }
}