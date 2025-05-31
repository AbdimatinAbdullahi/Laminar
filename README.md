# 💬 Laminar — A Microservices-Based Team Chat Platform

**Laminar** is a scalable, Slack-inspired real-time chat application built using modern microservices architecture. It includes workspace-based collaboration, messaging, voice/video huddles, and more — all backed by REST APIs, WebSockets, and event-driven services.

---

## 📌 Features

- 🔐 **User Authentication & JWT Authorization**
- 🧑‍💼 **Workspace Management**
  - Create, join via invite link, or switch between workspaces
- 📢 **Channel Communication**
  - Public and Private channels
  - Membership control for private channels
- 💬 **Messaging**
  - One-to-one and group messages
  - Message threads (replies)
  - Pinned messages
  - File attachments
- 🎥 **Huddles & Meetings**
  - Audio/video calls via custom SFU
  - Track meeting durations and participants
- 🌐 **Real-Time Messaging**
  - WebSocket support for live updates
- 🚀 **Microservices Architecture**
  - Services communicate via REST and/or message brokers
- 🐳 **Dockerized** for local and cloud deployment

---

## 🧱 Architecture Overview

### 🧑‍💻 Services

| Service              | Tech Stack       | Responsibility                              |
|----------------------|------------------|----------------------------------------------|
| **User Service**     | Python (Flask)   | Auth, users, workspaces, memberships         |
| **Message Service**  | Golang           | Channels, messages, threads, pins, files     |
| **Meeting Service**  | Golang + SFU     | Huddles (WebRTC), meeting logs               |

---

## 🛠️ Tech Stack

- 🐍 Python (Flask, SQLAlchemy)
- 💡 Go (net/http, gorilla/websocket)
- 🧠 PostgreSQL
- 🔒 JWT (auth)
- 🧵 WebSocket
- 🗂️ Redis or Kafka (for event handling)
- 🐳 Docker / Docker Compose
- ☁️ (Optional) Kubernetes-ready

---

# Day 1: 31/05/2025
 - 🗂️ Users Services and Workspace Set Up
 - 
