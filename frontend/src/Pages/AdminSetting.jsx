import React, { useEffect, useState } from 'react';
import style from '../Styles/admin.module.css';
import { useParams } from 'react-router';
import axios from 'axios';

function AdminSetting() {


    // Fetch workspace data nad dispatch this information
    const { worspaceId } = useParams()
    const [worspaceData, setWorspaceData] = useState([])
    const [members, setmembers] = useState([])

    useEffect(()=>{
        const fetchWorkspaceData = async()=>{
            try {
                const wsResponse = await axios.get("http://localhost:8008/workspace-data", { wsId: worspaceId})
                if(wsResponse.status == 200){
                    setWorspaceData(wsResponse.data.workspaceData) // Will make it array 
                }
            } catch (error) {
                console.log("Error fetching workspace data", error)
            }
        }


        const workspaceMembers = async () =>{
            try {
                const memebersRs = await axios.get('http://localhost:8008/workspace-data',  {wsId: worspaceId})
                if(memebersRs.status == 200){
                    setmembers(memebersRs.data.members)
                }
            } catch (error) {
                
            }
        }
    }, [])



  return (
    <div className={style.addminfContainer}>

      <div className={style.workspaceDetails}>
        <h3>Workspace Information</h3>
        <p>View the workspace name and creation date for reference.</p>
        {/* Actual data goes here */}
      </div>

      <div className={style.workspaceMembers}>
        <h3>Members</h3>
        <p>Manage members of this workspace. Assign roles or remove users if needed.</p>
        {/* Member list and role controls go here */}
      </div>

      <div className={style.Invitations}>
        <h3>Invitations</h3>
        <p>Invite new users via link. See pending invites and cancel them anytime.</p>
        {/* Invitation UI goes here */}
      </div>

      <div className={style.timeZone}>
        <h3>Time Zone</h3>
        <p>Set the default time zone for your workspace to ensure event and task sync.</p>
        {/* Time zone selector goes here */}
      </div>

      <div className={style.leaveWorkspace}>
        <h3>Leave Workspace</h3>
        <p>If you’re no longer part of this workspace, you can leave here.</p>
        {/* Leave button and confirmation */}
      </div>

      <div className={style.deleteWorkspace}>
        <h3>Delete Workspace</h3>
        <p><strong>Only the creator</strong> can permanently delete this workspace. This action is irreversible.</p>
        {/* Delete confirmation logic */}
      </div>
      
    </div>
  );
}

export default AdminSetting;
