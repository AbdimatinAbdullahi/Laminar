import React, {useState, useRef} from "react"
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import EmojiPicker from 'emoji-picker-react'
import { Bold, Italic, List, ListOrdered, Mic, SendHorizonal, SmilePlus, Upload } from 'lucide-react'

import style from '../Styles/chatroom.module.css'
import mediastyle from '../Styles/mediastyle.module.css'


function MessageComposer(){

  const [selectedFile, setselectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [message, setmessage] = useState("")
  const [selectedStyle, setselectedStyle] = useState("")
  const {isRecording, audioUrl, stopRecording, startRecording, setAudioUrl} = useAudioRecorder()
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const textareaRef = useRef(null) 

  function handleTextareaChange(e) {
  setmessage(e.target.value);
  const textarea = textareaRef.current;
  textarea.style.height = "auto"; // Reset height
  textarea.style.height = textarea.scrollHeight + "px"; // Set to new height
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

    const mimeToExtension = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
    "application/pdf": "PDF",
    "text/plain": "Text",
    "application/vnd.ms-excel": "Excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Spreadsheet",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx"
    // Adding more
    };
    
    const ext = mimeToExtension[selectedFile?.type] || selectedFile?.type;



  return (
    <div className={style.messageComposerContainer}>
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
              <button> ✅ </button>
            </div>
          )
        }

        {
          audioUrl && !isRecording && (
            <div>
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
                className={style.sendIcon} 
                style={message == "" ? { backgroundColor: "#3b36365b", color: "gray" } : { color: "green", backgroundColor: "#0080005d"  }} />
            </div>
        </div>
    </div>
  )
}


export default MessageComposer