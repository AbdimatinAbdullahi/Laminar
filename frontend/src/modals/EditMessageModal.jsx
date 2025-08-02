import React, {useState} from 'react'
import style from '../Styles/editmessagemodal.module.css'
import { useChat } from '../context/ChatContext'

function EditMessageModal({message, onClose}) {

    const { sendEditMessage, state } = useChat()
    const [newContent, setNewContent] = useState(message.content.text) // initial value of message
    const [loading, setLoading] = useState(false)
    
        
    const handleEdit = () => {
    if (newContent === message.content.text) return;
    setLoading(true);

    console.log("Waiting 60 seconds...");
        console.log("Running after delay");

        const newData = {
        type: "edit_message",
        payload: {
            newContent: newContent,
            messageId: message.id,
            channelId: state.activeChannel.id || null,
        },
        };

        sendEditMessage(newData);
        setLoading(false);
        onClose();
    };


  return (
    <div className={style.editMessageModalOverlay} >
        <div className={style.editMessageContainer}>
            <div className={style.editHeader}>
                <h4>Edit Message</h4>
            </div>
            <div className={style.messageEdit}>
                <textarea type="text" value={newContent} onChange={(e)=>setNewContent(e.target.value)} />
                {
                    message.content.attachments && message.content.attachments.length > 0 && <div className={style.attachment} >
                        {
                            message.content.attachments[0].type.startsWith("image/") && 
                            <div className={style.imageAttach}>
                                <img src={message.content.attachments[0].url} />     
                            </div>
                        }    

                        {
                            message.content.attachments[0].type.startsWith("video/") && 
                            <div className={style.videoAttach}> 
                                <video controls src={message.content.attachments[0].url} />
                            </div> 
                        }

                        {
                            message.content.attachments[0].type.startsWith("application/") && 
                                <div className={style.docs}>
                                    <div>
                                        📃
                                    </div>
                                    <a href={message.content.attachments[0].url} download={message.content.attachments[0].name}> {message.content.attachments[0].name} </a>

                                </div>
                        }

                </div>
                }
            </div>


            <div className={style.actionButtons}>
                <button onClick={onClose} className={loading ? style.disableButton : style.buttAct} >Discard</button>
                <button 
                className={newContent === message.content.text || loading ? style.disableButton : style.buttAct}
                disabled={newContent === message.content.text || loading} 
                onClick={handleEdit}
                >{loading ? "Saving" : "Save"}</button>
            </div>
        </div>
    </div>
  )
}

export default EditMessageModal