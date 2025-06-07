import React from 'react'
import { Link } from 'react-router'


function Home() {
  return (
    <div>
      <div>
        <Link to='/login'>Login</Link>
        </div>
        <div>
          <Link to='/register'>
            Create Account
          </Link>
        </div>
    </div>
  )
}

export default Home