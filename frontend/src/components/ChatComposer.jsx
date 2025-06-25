import React, { useState } from 'react'
import style from '../Styles/chatwindow.module.css'
import { Plus, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

function ChatComposer() {

  const [showPicker, setshowPicker] = useState(false)
  const [message, setmessage] = useState(false)

  const handleEmojiPick = (emojiData) => {
    setmessage(prev => prev + emojiData.emoji)
    setshowPicker(false)
  }
  

  return (
    <div className={style.composerContainer}>
        <Plus/>
        <input type="text" placeholder='Compose message' value={message} onChange={(e)=> setmessage(e.target.value)}  />
        <Smile onClick={()=> setshowPicker(!showPicker)} />
        {showPicker && <EmojiPicker onEmojiClick={handleEmojiPick} />}
    </div>
  )
}

export default ChatComposer