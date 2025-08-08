import React, { useState } from 'react'
import style from '../Styles/modals.module.css'
import { Hash, Lock, X } from 'lucide-react'
import { useChat } from '../context/ChatContext'

function ChannelCreationModal() {

    const {closeCreateChannelModal} = useChat()
    const [isPrivate, setIsPrivate] = useState(false)
    const [newChannelName, setNewChannelName] = useState("")


    const handleCreateChannel = ()=>{
        console.log(`Channel name: ${newChannelName} and channel type private: ${isPrivate}` )
        closeCreateChannelModal()
    }


  return (
    <div className={style.channelModalOverlay}>
        <div className={style.channelModalContainer}>
            <div className={style.header}>
                <h3>Create Channel</h3>
                <X style={{backgroundColor: "inherit"}} onClick={()=>closeCreateChannelModal()} />
            </div>
            <div className={style.channelInput}>
                {isPrivate ? <Lock size={30} style={{backgroundColor: "inherit"}} /> : <Hash size={30}  style={{backgroundColor: "inherit"}}/>}
                <input type="text" placeholder='Create channel' value={newChannelName} onChange={(e)=>setNewChannelName(e.target.value)}/>
            </div>
            <div className={style.typeChannel}>
                <h3>Private Channel</h3>
                <div className={ isPrivate ? style.privateToggle : style.publicToggle} onClick={()=>setIsPrivate(prev => !prev)} >
                    <span></span>
                </div>
            </div>

            <button style={newChannelName == "" ? {backgroundColor: "rgba(235, 255, 225)", color:'black'} : {}} onClick={handleCreateChannel} >Create Channel</button>
        </div>
    </div>
  )
}

export default ChannelCreationModal