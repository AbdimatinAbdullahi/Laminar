import React, { useEffect } from 'react'
import style from '../Styles/workspaces.module.css'

import { Plus, PlusIcon } from 'lucide-react'


function Workspaces({data, dispatch}) {

  const { workspaces, selectedWorkspace } = data

  const handleClick = (ws)=>{
    dispatch({type : "SELECT_WORKSPACE", payload: ws})
  }

  return (
    <div className={style.workspaceContainer}>

      <div className={style.directMessage}>
        D
      </div>
        {
          workspaces.map((ws)=>(
            <div className={style.workspace} onClick={()=>handleClick(ws)} >
              {ws.name.slice(0,2)}
            </div>
          ))
        }

        <div className={style.CreateWorkspace}>
          <Plus size={40} className={style.Icon}/>
        </div>
    </div>
  )
}

export default Workspaces