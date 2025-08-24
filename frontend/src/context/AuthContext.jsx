import { createContext, useContext, useEffect, useState } from 'react'
import {useNavigate} from 'react-router'
import axios from 'axios'


const AuthContext = createContext() // Creating the context that is called Auth context

const userURL = import.meta.env.VITE_USER_API_URL

export const AuthProvider = ({children})=>{

    const navigate = useNavigate()
    const [user, setUser] = useState({
        fullname: "",
        id: "",
        email: "",
        token: ""
    })

    
    useEffect(()=>{

        // On rendering of application we get the access token from local storage and send it to server to authenticate the user
        const authenticateUser = async ()=>{
            const accessToken = localStorage.getItem("lam")
            if(!accessToken){
                navigate("/")
                return
            }

            const authResponse = await axios.get(`${userURL}/api/protected`, 
                {
                    headers :{
                        "Authorization" : `Bearer ${accessToken}`
                    }
                }
            );

            // If Server returns 200
            if(authResponse.status == 200){
                setUser({
                    fullname: authResponse.data.fullname,
                    email: authResponse.data.email,
                    id: authResponse.data.id,
                    token: authResponse.data.token
                })
                //navigate to where user belongs or send it to message or workspace service
                navigate('/@me') 
            }
        }
        authenticateUser()
    }, [])


    const login = async (email, password)=>{
        console.log("User url: ", userURL)
        try {
            const authLoginResponse = await axios.post(`${userURL}/api/login`,
             {password, email}   
            )
            if(authLoginResponse.status == 200){
                localStorage.setItem("lam", authLoginResponse.data.token)
                setUser({
                    fullname: authLoginResponse.data.fullname,
                    email: authLoginResponse.data.email,
                    token: authLoginResponse.data.token,
                    id: authLoginResponse.data.id
                })
                navigate('/@me')
                return { succes: true}
            }
            
        } catch (error) {
            console.log("Error: ", login)
            return { succes: true }
        }
    }


    //Signup => Automaticaly logins in user when signup complete
    const signup = async (fullname, email, password)=>{
        try {
            const authSignupResponse = await axios.post(`${userURL}/api/register`,
                {fullname, email, password}
            )

            if(authSignupResponse.status == 200){
                login(email, password)
                return { succes: true }
            }
        } catch (error) {
            return { succes: false }
        }
    };

    const logout = ()=>{
        localStorage.removeItem("lam")
        setUser(null)
        navigate('/')
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>useContext(AuthContext)