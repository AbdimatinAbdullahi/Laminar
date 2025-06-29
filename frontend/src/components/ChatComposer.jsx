import React, { useEffect, useRef, useState } from 'react'
import style from '../Styles/chatwindow.module.css'
import { Plus, Smile, SendHorizontal, Images, Camera, File } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

function ChatComposer() {

  const [showPicker, setshowPicker] = useState(false)
  const [message, setmessage] = useState("")
  const [showUploadModal, setshowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  
  const handleEmojiPick = (emojiData) => {
    setmessage(prev => prev + emojiData.emoji)
    setshowPicker(false)
  }
  

  function handleSend(){
    if(message.trim() == "" && !selectedFile) return ;
    const payload = {
      message: message.trim() || null,
      file: selectedFile || null,
      timestamp: new Date().toISOString()
    }

    console.log("Sending to backend", payload)
    alert(payload.message)


    setmessage("");
    setSelectedFile(null);
  }


  return (
    <div className={style.composerContainer} >
        <Plus className={style.plusIconC} size={40} onClick={()=> setshowUploadModal(true)} />
          
        {selectedFile && (
          <div className={style.filePreview}>
            {/* Image Preview */}
            {selectedFile.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className={style.previewMedia}
              />
            )}

            {/* Video Preview */}
            {selectedFile.type.startsWith("video/") && (
              <video
                src={URL.createObjectURL(selectedFile)}
                controls
                className={style.previewMedia}
              />
            )}

            {/* Fallback for Document */}
            {selectedFile.type.startsWith("application/") && (
              <div className={style.docPreview}>
                📄
              </div>
            )}

            {/* File Info */}
            <div className={style.fileInfo}>
              <strong>{selectedFile.name}</strong>
              <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
              <span>{selectedFile.type}</span>
            </div>

            {/* Remove Button */}
            <button onClick={() => setSelectedFile(null)} className={style.removeFile}>
              ❌
            </button>
          </div>
        )}
        <input type="text" placeholder='Compose message' value={message} onChange={(e)=> setmessage(e.target.value)}  />

        <SendHorizontal className={style.sendIcon} onClick={handleSend} />
        <Smile onClick={()=> setshowPicker(!showPicker)} className={style.emojiIconC} size={20}/> 
        <div className={style.emojiContainer} >
          {showPicker && <EmojiPicker 
          onEmojiClick={handleEmojiPick}
          height={700}
          width={500}
          previewConfig={{showPreview: false}}
          emojiStyle='google'
          lazyLoadEmojis={true}
          // emojiSize={50} 
          className={style.EmojiPickerReact}
          />}
        </div>

        {showUploadModal && <UploadModal
         onClose={()=> setshowUploadModal(false)}
         setSelectedFile={setSelectedFile}
         />}

    </div>
  )
}

function UploadModal({onClose, setSelectedFile}){

  const modalRef = useRef()
  const fileInputRef = useRef()
  const [fileAcceptType, setfileAcceptType] = useState("")

  const handleFilePick = (accept) =>{
    setfileAcceptType(accept)
    setTimeout(()=>{
      fileInputRef.current?.click();
    }, 0)
  }

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        console.log("📁 Selected File:", file);
        onClose();
      }
  };


  useEffect(()=>{
    function handleClickOutside(e){
      if(modalRef.current && !modalRef.current.contains(e.target)){
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return ()=> document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])


  return (
    <div className={style.uploadModalContainer} ref={modalRef} >
      <input type="file" style={{display: "none"}}  ref={fileInputRef} accept={fileAcceptType}  onChange={handleFileChange}  capture={fileAcceptType === "image/*" ? "environment" : undefined} />
      <div className={style.videoAndPhoto} onClick={() => handleFilePick("image/*,video/*")} >
        <Images size={20}className={style.uploadIcons} />
          <div>Pic and Videos</div>
      </div>
      <div className={style.camera} onClick={() => handleFilePick("image/*")} >
        <Camera size={20}   className={style.uploadIcons}/>
        <div>Camera</div>
      </div>
      <div className={style.document} onClick={() => handleFilePick(".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt")} >
        <File size={20}   className={style.uploadIcons} />
        <div>Document</div>  
      </div>
    </div>
  )
}


export default ChatComposer