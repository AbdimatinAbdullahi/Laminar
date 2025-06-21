import React, { useState } from 'react'
import style from '../Styles/admin.module.css'
import {Boxes, ReceiptText, UserCog} from 'lucide-react'


import {useAdminContext} from '../context/AdminContext'


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
                <Boxes size={60} className={style.icon}/>
                 <span className={style.indicator}></span> {/* ACTIVE INDICATOR */}
                <>General</>
              </div>

              <div className={`${style.users} ${selectedTab === "usersManagement" ? style.activeTab : ""}`} onClick={()=>setSelectedTab("usersManagement")} >
                <UserCog size={60} className={style.icon} />
                <span className={style.indicator}></span> {/* ACTIVE INDICATOR */}
                <>User managmenent</>
              </div>

              <div className={`${style.billing} ${selectedTab === "billing" ? style.activeTab : ""}`} onClick={()=>setSelectedTab("billing")} >
                <ReceiptText size={60} className={style.icon} />
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

  return (
    <div className={style.generalContainer}>

        <div className={style.workspaceName}>
          <h3>Name</h3>
          <p>Manage and Edit names of the workspace</p>
          <input type="text" value={workspaceData?.Name}/>
        </div>

        <div className={style.workspaceDate}>
          <h3>Workspace Created on</h3>
          <span>{workspaceData?.DateCreated}</span>
        </div>

        <div className={style.workspaceCreatorDetails}>
          <div className={style.name}>
              <h3>Creator Name</h3>
              <span>
                {workspaceCreator?.Name}
              </span>
          </div>

          <div className={style.email}>
              <h3>Creator Name</h3>
              <span>{workspaceCreator?.Email}</span>
          </div>

        </div>

        <div className={style.leaveWorkspace}>
          <h3>Leave Workspace</h3>
          <p>If youre are no longer part of the workspace you can leave</p>
          <button>Leave  workspace</button>
        </div>

        <div className={style.deleteWorkspace}>
          <h3>Delete Workspace</h3>
          <p>You can delete the workspace if it is not longer functional</p>
          <button>Delete  workspace</button>
        </div>

    </div>
  )
}


function UserManagement(){

  const { state } = useAdminContext()
  const { workspaceMemebers } = state;
  return (
    <div className={style.userContainer}>

      <div className={style.users}>


        <div className={style.userHeader}>
          <div className={style.userMan}>
            User Managment
          </div>
          <div className={style.profile}>
            <div>Profile</div>
          </div>
        </div>


        <table>
          <thead>
            <tr>
            <th className={style.userDetails}>Name</th>
            <th className={style.userJoined}>Member since</th>
            <th className={style.userRole}>Role</th>
            <th className={style.userAction}>Action</th>
            </tr>
          </thead>
          <tbody>
            {workspaceMemebers.map((member)=>(
              <tr key={member.User.Email}>

                <td className={style.rowDet}> 
                  <div> {member?.User?.Name} </div> 
                  <div> {member?.User?.Email} </div> 
                </td>

                <td className={style.rowJoinSince}>
                    {member.WorkspaceInfo.JoinedAt}
                </td>

                <td className={style.rowRole}>
                  {member.WorkspaceInfo.Role}
                </td>

                <td className={style.rowAction} >
                  <button> Action </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}