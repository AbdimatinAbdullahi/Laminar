import React, {useState} from 'react'
import {Link} from 'react-router'
import style from '../Styles/login.module.css'
import {Eye, EyeOff, X} from 'lucide-react'
import {useAuth} from '../context/AuthContext'




function Login() {

  const { login} = useAuth()
  const [ typePassword, settypePassword ] = useState("password")
  const [ loginError, setLoginError ] = useState("")
  const [ userCredintials, setUserCredintials ] = useState({ password: "", email: ""})


  const handleLogin = async (e)=>{
    e.preventDefault()
    if(userCredintials.email === "" || userCredintials.password === ""){
      return
    }
    const result = await login(userCredintials.email, userCredintials.password)
    if(!result.success){
      setLoginError("Error while login")
    }
  }


  return (
    <div className={style.loginContainer} >
      <form className={style.formContainer}>
        
        <div className={style.formHeader}>
            Welcome to Laminar
        </div>

        {
          loginError != "" && (
            <div className={style.loginError} >
                <span> {loginError} </span>
                <X onClick={()=> setLoginError("")} />
            </div>
          )
        }

        <div className={style.emailInput}>
          <input type="email" placeholder='Email' onChange={(e)=> setUserCredintials({...userCredintials, email: e.target.value})} />
        </div>

        <div className={style.passwordInput}>
          <input type={typePassword} placeholder='Password' onChange={(e) => setUserCredintials({...userCredintials, password: e.target.value})}/>
          {typePassword === "text" ? <EyeOff onClick={()=>settypePassword("password")} size={20}/> : <Eye size={20} onClick={()=>settypePassword("text")}/>}
        </div>

        <div className={style.submitBut}>
          <button onClick={handleLogin}>Login</button>
        </div>

        <div className={style.somCon}>
          <div>Dont have an account? <Link to='/register'>Create Account</Link></div>
          <div>Forget password? <Link to='/reset'>Reset Password</Link></div>
        </div>

      </form>
    </div>
  )
}

export default Login