import React, {useState} from 'react'
import {Link} from 'react-router'
import style from '../Styles/singupcontainer.module.css'
import {Eye, EyeOff, X} from 'lucide-react'
import {useAuth} from '../context/AuthContext'


function Signup() {

  const { signup } = useAuth()
  const [ signupError, setSignupError ] = useState("")
  const [ typePassword, settypePassword ] = useState("password")
  const [ typeConfirmPassword, setTypeConfirmPassword ] = useState("password")
  const [ userCredintials, setUserCredintials ] = useState({ fullname: "", password: "", email: "", confirmPassword: ""})


  const handleRegister = async (e)=>{
    e.preventDefault()
    if(userCredintials.email === "" || userCredintials.password === ""){
      setSignupError("Provide all required fields")
      return
    }
    const result = await signup(userCredintials.fullname, userCredintials.email, userCredintials.password)
    if(!result.succes){
      setSignupError("Something went wrong while creating account")
    }
  }


  return (
    <div className={style.signupContainer}>
      <form className={style.formContainer}>
        
        <div className={style.formHeader}>
            Welcome to Laminar
        </div>

        {
          signupError != "" && (
            <div className={style.signupError} >
                <span> {signupError} </span>
                <X onClick={()=> setSignupError("")} />
            </div>
          )
        }

        <div className={style.fullnameInput}>
          <input type="text" placeholder='Enter fullname' onChange={(e)=> setUserCredintials({...userCredintials, fullname: e.target.value})} />
        </div>

        <div className={style.emailInput}>
          <input type="email" placeholder='Email address' onChange={(e)=> setUserCredintials({...userCredintials, email: e.target.value})} />
        </div>

        <div className={style.passwordInput}>
          <input type={typePassword} value={userCredintials.password} placeholder='Create password' onChange={(e) => setUserCredintials({...userCredintials, password: e.target.value})}/>
          {typePassword === "text" ? <EyeOff onClick={()=>settypePassword("password")} size={30}/> : <Eye size={30} onClick={()=>settypePassword("text")}/>}
        </div>

        <div className={style.confirmPasswordInput}>
          <input type={typeConfirmPassword} value={userCredintials.confirmPassword} placeholder='Confirm password' onChange={(e) => setUserCredintials({...userCredintials, confirmPassword: e.target.value})}/>
          {typeConfirmPassword === "text" ? <EyeOff  onClick={()=>setTypeConfirmPassword("password")} size={30}/> : <Eye size={30} onClick={()=>setTypeConfirmPassword("text")}/>}
        </div>

        <div className={style.submitBut}>
          <button onClick={handleRegister}>Create Account</button>
        </div>

        <div className={style.somCon}>
          <div>Already have an account? <Link to='/login'>Sign In</Link></div>
        </div>

      </form>
    </div>
  )
}

export default Signup