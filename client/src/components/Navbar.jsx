import React, { useContext } from 'react'
import Logo from '../assets/Logo2.png'
import {assets} from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
const Navbar = () => {

    const navigate = useNavigate()
    const {userData,backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

    const sendVerificationOtp = async () => {
      try {
        axios.defaults.withCredentials= true
        const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
        
        if(data.success){
          navigate('/email-verify')
          toast.success('Verification OTP sent successfully')
        }
        
      } catch (error) {
         toast.error(error.msg)
      }
    }

    const logout = async () => {
      try {
        axios.defaults.withCredentials= true
        const {data} = await axios.post(backendUrl + '/api/auth/logout')
        
        if(data.success){
          setIsLoggedin(false)
          setUserData(false)
          // toast.success('Logged out successfully')
          navigate('/')
        }
        
      } catch (error) {
         toast.error(error.msg)
      }
    }

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img onClick={(e) => navigate('/')} src={Logo} alt="" className='w-28 sm:w-32 cursor-pointer' />
      {userData ? 
      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group '>
        {userData.name[0].toUpperCase()}
         <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
           <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
            {!userData.isAccountVerified && 
            <li onClick={sendVerificationOtp} className='py-1 px-2  hover:
            bg-gray-200 cursor-pointer'>Verify email</li>
            }
            <li onClick={logout} className='py-1 px-2  hover:
            bg-gray-200 cursor-pointer pr-10'>Logout </li>
           </ul>
         </div>
      </div> 
      : <button onClick={() => navigate('/login')} className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 cursor-pointer text-gray-800 hover:bg-gray-100 transition-all'>Login <img src={assets.arrow_icon} alt="" /> </button>
      }
    </div>
  )
}

export default Navbar