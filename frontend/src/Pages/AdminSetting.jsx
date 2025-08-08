import React, { useState } from 'react'
import style from '../Styles/admin.module.css'
import {Boxes, ReceiptText, UserCog} from 'lucide-react'


import {useAdminContext} from '../context/AdminContext'
import UserManagement from '../components/UserManagement'
import DeleteWorkspace from '../modals/DeleteWorkspace'
import Leaveworkspace from '../modals/Leaveworkspace'

function AdminSetting() {

  const [selectedTab, setSelectedTab] = useState("general")

  return (
    <div className={style.adminContainer} >
        <div className={style.controlBar}>

            <div className={style.Header}>
              {/* Display => Name of the application*/}
              Laminar
            </div>

            <div className={style.coreManagement}>
              <h2>Managment</h2>
              
              <div className={`${style.general} ${selectedTab === "general" ? style.activeTab : ""}`} onClick={()=>setSelectedTab("general")} >
                <Boxes size={30} className={style.icon}/>
                 <span className={style.indicator}></span> {/* ACTIVE INDICATOR */}
                <>General</>
              </div>

              <div className={`${style.usersTab} ${selectedTab === "usersManagement" ? style.activeTab : ""}`} onClick={()=>setSelectedTab("usersManagement")} >
                <UserCog size={30} className={style.icon} />
                <span className={style.indicator}></span> {/* ACTIVE INDICATOR */}
                <>User managmenent</>
              </div>

              <div className={`${style.billing} ${selectedTab === "billing" ? style.activeTab : ""}`} onClick={()=>setSelectedTab("billing")} >
                <ReceiptText size={30} className={style.icon} />
                <span className={style.indicator}></span> {/* ACTIVE INDICATOR */}
                Billing
              </div>

            </div>
        </div>


        <div className={style.selectedContainer}>
          {/* Workspace General Information */}

          {selectedTab === "general" && <General/>}

          {/* User managment => change role and remove */}
          {selectedTab === "usersManagement" && <UserManagement/>}

        </div>
    </div>
  )
}

export default AdminSetting


// General Information of workspace
function General(){

  const { state } = useAdminContext()
  const {leaveWorkspace, deleteWorkspace, workspaceCreator, workspaceData} = state;
  const [deleteWorskspaceModalModalOpen, setdeleteWorskspaceModalModalOpen] = useState(false)
  const [leaveModalOpen, setleaveModalOpen] = useState(false)
  return (
    <div className={style.generalContainer}>

        <div className={style.workspaceName}>
          <p>Manage and Edit names of the workspace (Only creator or user with relevant role) </p>
          <input type="text" value={workspaceData?.Name}/>
          <p>Created on {workspaceData?.DateCreated || "25th May 2018"} </p>
          <button>Change Name</button>
        </div>

        <div className={style.leaveWorkspace}>
          <h3>Leave Workspace</h3>
          <p>If youre are no longer part of the workspace you can leave</p>
          <button onClick={()=> setleaveModalOpen(true)} >Leave  workspace</button>
        </div>

        {leaveModalOpen && <Leaveworkspace onClose={()=> setleaveModalOpen(false)} />}


          <div className={style.name}>
              <h3>Creator Name</h3>
              <span>{workspaceCreator?.Name}</span>
          </div>

          <div className={style.email}>
              <h3>Creator Name</h3>
              <span>{workspaceCreator?.Email}</span>
          </div>


          <div className={style.deleteWorkspace}>
            <h3>Delete Workspace</h3>
            <p>You can delete the workspace if it is not longer functional</p>
            <button onClick={()=> setdeleteWorskspaceModalModalOpen(true)}>Delete  workspace</button>
        </div>

        {deleteWorskspaceModalModalOpen && <DeleteWorkspace onClose={()=>setdeleteWorskspaceModalModalOpen(false)} />}

    </div>
  )
}

