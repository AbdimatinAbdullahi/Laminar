import React from 'react'
import style from '../Styles/modals.module.css'
import { useChat } from '../context/ChatContext'
import { Minimize2 } from 'lucide-react'

function FileModal() {
    const {closeModal, fileModalContent} = useChat()
  return (
    <div className={style.fileModalContainerOverlay}>
        <div className={style.fileModalContainer}>
            <Minimize2 className={style.Minimize2Icon} onClick={()=> closeModal()} size={30}/>
            <div className={style.attachment}>
              {fileModalContent.type.startsWith("image/") && 
              <div className={style.imageContainer}>
                <img src={fileModalContent.url} />
                </div>
              }

              {fileModalContent.type.startsWith("video/") && <div className={style.videoContainer} >
                <video controls src={fileModalContent.url} />
                </div>}
            </div>
        </div>
    </div>
  )
}

export default FileModal