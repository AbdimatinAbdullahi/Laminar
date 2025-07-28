import React, {useState} from 'react'
import style from '../Styles/editmessagemodal.module.css'

function EditMessageModal({message, onClose}) {

    const [newContent, setNewContent] = useState(message.content.text) // initial value of message
    const handleEdit = ()=>{
        if(newContent === message.content.text) return
        
    }

  return (
    <div className={style.editMessageModalOverlay} >
        <div className={style.editMessageContainer}>
            <div className={style.editHeader}>
                <h4>Edit Message</h4>
            </div>
            <div className={style.messageEdit}>
                <textarea type="text" value={newContent} onChange={(e)=>setNewContent(e.target.value)} />
            </div>
            <div className={style.actionButtons}>
                <button onClick={onClose} className={style.buttAct} >Discard</button>
                <button 
                className={newContent === message.content.text ? style.disableButton : style.buttAct}
                disabled={newContent === message.content.text} 
                >Save edit</button>
            </div>
        </div>
    </div>
  )
}

export default EditMessageModal