import React, {useState} from 'react'
import {Link} from 'react-router'
import style from '../Styles/singupcontainer.module.css'
import {Eye, EyeOff} from 'lucide-react'
import {useAuth} from '../context/AuthContext'




function Signup() {

  const {signup} = useAuth()
  const [typePassword, settypePassword] = useState("password")
  const [userCredintials, setUserCredintials] = useState({ fullname: "", password: "", email: ""})


  const handleRegister = (e)=>{
    e.preventDefault()
    if(userCredintials.email === "" || userCredintials.password === ""){
      return
    }
    signup(userCredintials.email, userCredintials.password)
  }


  return (
    <div className={style.signupContainer} >
      <form className={style.formContainer}>
        
        <div className={style.formHeader}>
            Welcome to Laminar
        </div>


        <div className={style.fullnameInput}>
          <input type="text" placeholder='Enter fullname' onChange={(e)=> setUserCredintials({...userCredintials, fullname: e.target.value})} />
        </div>

        <div className={style.emailInput}>
          <input type="email" placeholder='Email address' onChange={(e)=> setUserCredintials({...userCredintials, email: e.target.value})} />
        </div>

        <div className={style.passwordInput}>
          <input type={typePassword} placeholder='Create password' onChange={(e) => setUserCredintials({...userCredintials, password: e.target.value})}/>
          {typePassword === "text" ? <EyeOff onClick={()=>settypePassword("password")} size={40}/> : <Eye size={40} onClick={()=>settypePassword("text")}/>}
        </div>

        <div className={style.confirmPasswordInput}>
          <input type={typePassword} placeholder='Create password' onChange={(e) => setUserCredintials({...userCredintials, password: e.target.value})}/>
          {typePassword === "text" ? <EyeOff onClick={()=>settypePassword("password")} size={40}/> : <Eye size={40} onClick={()=>settypePassword("text")}/>}
        </div>

        <div className={style.submitBut}>
          <button onClick={handleRegister}>Create Account</button>
        </div>

        <div className={style.somCon}>
          <div>Already have an account? <Link to='/register'>Sign In</Link></div>
        </div>

      </form>
    </div>
  )
}

export default Signup