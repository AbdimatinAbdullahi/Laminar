# **Laminar- A blazingly fast chat application for teams**

## What it does (features) ?
 **Laminar** is real time chat application that is designed for small teams (upto ~ 100 members). It enables:
  - 💬 **Live messages** between team members
  - ⏩ **Real time** file sharing
  - 📧 **Role based** inviting members
  - 🔐 **Private channel** messaging
  
## 🧰 Technologies Used

- **React**  - Frontend framework using native WebSockets for real-time interactions
- **Python** – Used in user services for creating and managing user accounts
- **Golang** – Powers the message service due to its blazing fast concurrency support
- **PostgreSQL** – Stores structured data such as workspaces, users, channels, memberships, and invitations
- **MongoDB** – Used for storing chat messages thanks to its flexible schema
- **AWS S3** – Stores binary/blob data like images, videos, and other file attachments
- **AWS CloudFront** – Acts as a CDN to speed up the delivery of blob data


## Architecture and Design Decisions.

Laminar is microservices based architecture(Two):
 - **User services** That handles regsistration of users
 - **Messaging services** That focuses on workspace and message related operation

 ### Real time communication
 - uses **Websockets** to enable instantenous message delivery and updates(Like delete and reactions update)
 - Each user maintains persistent connection to the messaging services which routes message in real time

### 🔐 User Authentication and Messaging Flow

1. **User Signup**
   - A user signs up via the **User Service**.
   - On successful registration, the user is automatically logged in (this can be changed to redirect to a login page, depending on UX preference).

2. **Token Generation**
   - On login, the **User Service** responds with a **JWT token** which contains user-specific data (e.g., user ID, roles, etc.).

3. **Token Decoding by Message Service**
   - The **Message Service** receives the token from the frontend.
   - It **decodes the token** to extract the `user_id`.

4. **Fetching Workspaces & Channels**
   - Using `user_id`, the backend fetches all workspaces the user is part of, along with channels in each workspace.
   - Response: `GetWorkspaceAndChannels(user_id)`

5. **Channel Selection by User**
   - The frontend displays available channels.
   - When a user clicks on a channel, the **Channel ID** is sent to the backend.

6. **Fetching Channel Messages**
   - When a user selects a channel, the channel ID is sent to the backend.
   - The Message Service uses GetMessages(channelId, cursor, receiverType) to retrieve messages.
   - Messages are fetched in reverse chronological order (most recent first), based on the cursor (a timestamp of the last message fetched).
   - The first request uses an empty cursor to get the latest messages.
   - As the user scrolls up, the client sends the timestamp of the oldest loaded message as the new cursor, fetching older messages.
   - This ensures pagination and efficient loading of historical data.
   - Response: `GetMessages(channel_id)`

7. **Private Channel Validation**
   - If the selected channel is private, the client sends a request to validate access.
   - Backend checks if the user belongs to that private channel.
   - Response: `ValidateUser(user_id, channel_id)`


