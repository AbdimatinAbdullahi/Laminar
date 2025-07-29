import EmojiPicker from 'emoji-picker-react'
import React, {useState, useRef, useEffect, use} from "react"
import { Mic, SendHorizonal, SmilePlus, Upload, X } from 'lucide-react'

import style from '../Styles/chatroom.module.css'
import mediastyle from '../Styles/mediastyle.module.css'

import { useChat } from "../context/ChatContext"
import { useAuth } from "../context/AuthContext"
import { useAudioRecorder } from '../hooks/useAudioRecorder'


import { mimeToExtension } from '../utils/filesRename'
import { uploadTOS3 } from '../utils/uploadTOS3'


function MessageComposer({replyTo, handleReply}){

  const [message, setmessage] = useState("")
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)


  const { user } = useAuth()
  const { sendMessage, state } = useChat()
  const { isRecording, audioUrl, stopRecording, startRecording, setAudioUrl, setIsRecording} = useAudioRecorder()


  const emojiPicker = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFile, setselectedFile] = useState(null)

  const ext = mimeToExtension[selectedFile?.type] || selectedFile?.type;

  // Function to handle Text Change
  function handleTextareaChange(e) {
    setmessage(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = textarea.scrollHeight + "px"; // Set to new height
  }

  // Function to handle emoji pick
  const handleEmojiClick = (emojiData, event) =>{
    setmessage((prev) => prev + emojiData.emoji)
  }


  const handleSendMesssage = async (e) =>{
    if(!message && !audioUrl && !selectedFile) return

    if(message && !audioUrl && !selectedFile){
      sendMessage({ 
        type: "message",
        payload: {
          content: {
            text: message
          },
          timestamp: new Date().toISOString(),
          sender_id: user.id,
          receiver_id: state.activeChannel.id,
          receiver_type: state.activeChannel ? "channel" : "user",
          Sender: {
            id: user.id,
            fullname: user.fullname,
            email: user.email
          }
        }
      });
    }

    if(selectedFile){
      const fileURL = uploadTOS3(selectedFile.file)
      const fileMessage = {
        type: selectedFile.type.startsWith("image/") ? "image" : selectedFile.type.startsWith("video/") ? "video" : "file",
        payload: {
          url: fileURL,
          message:  message !== "" ? message : "",
          filename: selectedFile.name,
          filetype: selectedFile.type,
          filesize: selectedFile.size,
          timestamp: new Date().toISOString(),
          senderID: user.id,
          channelID: state.activeChannel.id

        } 
      }
      sendMessage(fileMessage);
      setselectedFile(null)
    }

    if(audioUrl && !isRecording){
      const blob = await fetch(audioUrl).then(res => res.blob())
      const file = new File([blob], `audio-${new Date()}.webm`,{
        type: "audio/webm"
      })

      const uploadAudioURL = uploadTOS3(file)
      const audioMessage = {
        type: "message",
        payload : {
          url: uploadAudioURL,
          message: message !== "" ? message : "",
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          timestamp: new Date().toISOString(),
          senderID: user.id,
          channelID: state.activeChannel.id
        }
      }
      sendMessage(audioMessage)
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setmessage("")
  }


  function handleFileSelect(e){
    const file = e.target.files[0]
    if(file){
        setselectedFile({
            file,
            type: file.type,
            url: URL.createObjectURL(file)
        });
      e.target.value = null;
    };
  }


  useEffect(()=>{

    const handleOutsideClick = (e)=>{
      if(emojiPicker.current && !emojiPicker.current.contains(e.target)){
        setEmojiPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])


  return (
    <div className={style.messageComposerContainer}>

    {replyTo && ( <div className={style.replyToContainer} > 
                    <span className={style.replyIndicator}></span>
                      <div className={style.replyMessage}>
                        <div className={style.replySender}>
                          {replyTo?.Sender.fullname}
                        </div>
                        <div className={style.messageReplyContent}>
                            {replyTo.content.text}
                        </div>
                      </div>
                    <X className={style.removeReply} size={30} onClick={()=>handleReply(null)} />
                </div> )}

      {emojiPickerOpen && <div ref={emojiPicker} className={style.emojiPickerForMessage}> <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} /> </div>}
        <div className={style.messageContainer}>
          <textarea value={message} ref={textareaRef} onChange={handleTextareaChange} placeholder='Type your message here' />
        </div>

        {selectedFile && 
          (
            <div className={mediastyle.filePreviewContainer}>
              {selectedFile.type.startsWith("image/") && (
                <div className={mediastyle.imgPreview}>
                    <button onClick={()=>setselectedFile(null)}>❌</button>
                    <img src={selectedFile.url} alt="Preview"/>    
                </div>
              )}


              {selectedFile.type.startsWith("video/") && (
                <div className={mediastyle.videoPreview}>
                    <button onClick={()=>setselectedFile(null)}>❌</button>
                    <video src={selectedFile.url} controls className={mediastyle.videoPreview} ></video>
                </div>
              ) }

               {!selectedFile.type.startsWith("image/") &&
                !selectedFile.type.startsWith("video/") && (
                  <div className={mediastyle.otherPreview}>
                    <button onClick={()=>setselectedFile(null)}>❌</button>
                    <div className={mediastyle.fileIcon}>📃</div>
                    <div className={mediastyle.fileInfo}>
                        <div className={mediastyle.fileName}> {selectedFile?.file.name} </div>
                        <div className={mediastyle.fileType}> {ext} </div>
                    </div>
                  </div>
              )}
            </div>
          )
        }

        {
          isRecording && (
            <div className={mediastyle.recording} >
              <h3>Recording .... </h3>
              <button onClick={stopRecording} > ❌ </button>
              <button onClick={()=> setIsRecording(false)} > ✅ </button>
            </div>
          )
        }

        {
          audioUrl && !isRecording && (
            <div className={mediastyle.audioReco} > 
              <audio controls src={audioUrl}/>
              <button onClick={() => {
                URL.revokeObjectURL(audioUrl); // Clean up the blob URL
                setAudioUrl(null);
              }}>❌</button>
            </div>
          )
        }


        <div className={style.messageFunctionality}>
            <div className={style.messagesAdds}>
              <Upload 
                className={style.addsIcon} 
                onClick={()=> fileInputRef.current?.click()}
                />
              <input 
                    type='file'
                    ref={fileInputRef} 
                    style={{display: "none"}} 
                    onChange={handleFileSelect} 
                    />
              <Mic 
                className={`${style.addsIcon} ${isRecording ? style.recording : ''}`}
                onClick={isRecording ? stopRecording : startRecording} />
              <SmilePlus className={style.addsIcon} onClick={()=> setEmojiPickerOpen(!emojiPickerOpen)} />
            </div>
            <div className={style.sendIconC}>
              <SendHorizonal 
                onClick={handleSendMesssage}
                className={style.sendIcon} 
                style={message == "" ? { backgroundColor: "#3b36365b", color: "gray" } : { color: "green", backgroundColor: "#0080005d"  }} />
            </div>
        </div>
    </div>
  )
}


export default MessageComposer