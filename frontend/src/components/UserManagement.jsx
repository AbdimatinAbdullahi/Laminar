import React from 'react'
import style from '../Styles/admin.module.css'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EllipsisVertical } from 'lucide-react';

dayjs.extend(relativeTime);

import { useAdminContext } from '../context/AdminContext';

function UserManagement() {
  const { state } = useAdminContext();
  const { workspaceMemebers, workspaceData, invitations } = state;

  return (
    <div className={style.userContainer}>

      {/* 100vh */}
      <div className={style.membersContainer}>

        {/* 1 */}
        <div className={style.userHeader}>
          <div className={style.userMan}>
            <h2>User Management</h2>
            <p>{workspaceData.Name}</p>
          </div>
          <div className={style.profile}>
            <div>Profile</div>
          </div>
        </div>

        {/* 2 */}
        <div className={style.tableWrapper}>
          <div className={style.userLength}>
            Users({workspaceMemebers.length})
          </div>

          {/* Grid Header */}
          <div className={`${style.gridRow} ${style.gridHeader}`}>
            <div>Name</div>
            <div>Email</div>
            <div>Member since</div>
            <div>Role</div>
            <div>Status</div>
            <div></div>
          </div>

          {/* Grid Rows */}
          {workspaceMemebers.map((member, index) => (
            <div
              key={member.User.Email}
              className={`${style.gridRow} ${style.tableRows}`}
            >
              <div>{member.User.Name}</div>
              <div>{member.User.Email}</div>
              <div>{dayjs(member.WorkspaceInfo.JoinedAt).fromNow()}</div>
              <div>{member.WorkspaceInfo.Role}</div>
              <div>Active</div>
              <div><EllipsisVertical style={{ backgroundColor: "inherit", cursor: "pointer" }} size={50} /></div>
            </div>
          ))}
        </div>


      </div>

      <div className={style.invitations}>
        <div className={style.invitationHeader}>
          <h2>Invitations</h2>
        </div>

        <div className={style.invitationsTable}>
          {invitations.length > 0 ? (
            <>
            <button>Invite</button>
            <div className={style.invitationList}>
              <div className={`${style.gridRow} ${style.gridHeader}`}>
                <div>Name</div>
                <div>Email</div>
                <div>Status</div>
                <div>Invited At</div>
                <div>Action</div>
              </div>

              {invitations.map((invite, index) => (
                <div
                  key={invite.Email}
                  className={`${style.gridRow} ${style.tableRows}`}
                  style={{ backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}
                >
                  <div>{invite.Name || '—'}</div>
                  <div>{invite.Email}</div>
                  <div>Pending</div>
                  <div>{dayjs(invite.InvitedAt).fromNow()}</div>
                  <button>Cancel Invite</button>
                </div>
              ))}
            </div>
            </>
            
          ) : (
            <div className={style.invitationEmptyState}>
              <h3>No invitations found!</h3>
              <button>Invite</button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default UserManagement;
