# **Laminar- A blazingly fast chat application for teams**

## What it does (features) ?
 **Laminar** is real time chat application that is designed for small teams (upto ~ 100 members). It enables:
  - 💬 **Live messages** between team members
  - ⏩ **Real time** file sharing
  - 📧 **Role based** inviting members
  - 🔐 **Private channel** messaging
  
## What is used?
 - **React** - Is used as frontend framework with native websockets
 - **Python** Python is used in user services to create and manage accounts
 - **Golang** - Golang is used in message services since it is balzing fast.
 - ** Postgres** - Postgres is used to hold workspaces data, users data, channels, workspace memebrships, private channels memberships, workspace invitations
 - **Mongo Database** - Because of its flexible schema, I used mongo database to mainly store the messages
 - **AWS S3 Storage** - S3 is used to store the blob data such as, images, videos and files
 - **AWS CloudFront** - AWS cloud front is as content delivery network to optimize the delivary of blob data

## Architecture and Design Decisions
