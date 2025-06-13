import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router'
import { AuthProvider } from './context/AuthContext'

import Home from './Pages/Home'
import Login from './Pages/Login'
import ChatRoom from './Pages/ChatRoom'
import Signup from './Pages/Signup'
import { ChatProvider } from './context/ChatContext'


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Signup/>}/>
          <Route path='/@me' element={
            <ChatProvider>
              <ChatRoom/>
            </ChatProvider>
          }/>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App