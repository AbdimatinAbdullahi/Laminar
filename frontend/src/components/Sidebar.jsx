import React from 'react'
import style from '../Styles/sidebar.module.css'
import Workspaces from './Workspaces'

function Sidebar() {
  return (
    <div className={style.sidebarContainer} >
       <Workspaces/>
    </div>
  )
}

export default Sidebar