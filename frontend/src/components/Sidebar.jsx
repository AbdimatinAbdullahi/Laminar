import React from 'react'
import style from '../Styles/sidebar.module.css'


import Workspaces from './Workspaces'
import Channels from './Channels'


function Sidebar({ data, dispatch }) {

  return (
    <div className={style.sidebarContainer} >
       <Workspaces data={data} dispatch={dispatch}/>
       <Channels data={data} dispatch={dispatch} />
    </div>
  )
}

export default Sidebar