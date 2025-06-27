import React, { useState } from 'react'
import style from '../Styles/chatwindow.module.css'
import { Plus, Smile, SendHorizontal, Images, Camera, File } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

function ChatComposer() {

  const [showPicker, setshowPicker] = useState(false)
  const [message, setmessage] = useState("")
  const [showUploadModal, setshowUploadModal] = useState(false)

  const handleEmojiPick = (emojiData) => {
    setmessage(prev => prev + emojiData.emoji)
    setshowPicker(false)
  }
  

  return (
    <div className={style.composerContainer}>
        <Plus className={style.plusIconC} size={40} onClick={()=> setshowUploadModal(true)} />
        <input type="text" placeholder='Compose message' value={message} onChange={(e)=> setmessage(e.target.value)}  />
        <SendHorizontal className={style.sendIcon} />
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

        {showUploadModal && <UploadModal/>}

    </div>
  )
}

function UploadModal(){
  return (
    <div className={style.uploadModalContainer}>
      <div className={style.videoAndPhoto}>
        <Images size={30}/>
          <div>Photo and Videos</div>
      </div>
      <div className={style.camera}>
        <Camera/>
        <div>Camera</div>
      </div>
      <div className={style.document}>
        <File/>
        <div>Document</div>  
      </div>
    </div>
  )
}




export default ChatComposer