import React, { useContext, useRef, useState } from 'react'
import Logo from '../assets/Logo2.png'
import {assets} from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'


const ResetPassword = () => {

   axios.defaults.withCredentials = true
   const {backendUrl} = useContext(AppContext)

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [isEmailSent,setIsEmailSent] = useState('')
  const [otp,setOtp] = useState(0)
  const [isOtpSubmited,setisOtpSubmited] = useState(false)

   const inputRefs = useRef([])
  
    const handelInput = (e, index) => {
     if(e.target.value.length > 0 && index < inputRefs.current.length -1){
        inputRefs.current[index + 1].focus();
     }
    }
  
    const deleteInput = (e,index) => {
     if(e.key === 'Backspace' && e.target.value === '' && index > 0){
        inputRefs.current[index - 1].focus();
     }
    }
  
    const handlePaste = (e) => {
     const paste = e.clipboardData.getData('text')
     const pasteArray = paste.split('')
     pasteArray.forEach((char,index) => {
        if(inputRefs.current[index]){
           inputRefs.current[index].value = char;
        }
     });
    }

    const onSubmitHandler = async (e) => {
      e.perventDefault();
      try {
        const {data} = await axios(backendUrl + '/api/auth/send-reset-otp', {email}) 
        data.success ? toast.success(data.success) : toast.error(data.error)
        data.success && setIsEmailSent(true)
        console.log(data)
      } catch (error) {
        toast.error(error.message);
      }
    }
  
  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 to-green-400'>
        <img src={Logo} alt="" className='absolute w-28 sm:w-32 left-5 sm:left-20 top-5 cursor-pointer' />
       
       {!isEmailSent &&
        <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your registered email id.</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.mail_icon} alt="" className='w-3 h-3' />
          <input onChange={e=> setEmail(e.target.value)} value={email} type="email" placeholder=' Email id' className='bg-transparent outline-none text-white' required />
        </div>
        <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer mt-3'>Submit</button>
        </form>
}
        {/* otp form */}
      
      {!isOtpSubmited && isEmailSent &&

        <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset passowrd Otp</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
             {Array(6).fill(0).map((_, index)=>(
               <input 
               type="text" 
               max='1'
                key={index}
                required
               className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
               ref={e => inputRefs.current[index] = e}
               onInput={e => handelInput(e, index)}
                onKeyDown={e => deleteInput(e, index)}
                />
            ))}
          </div>
          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Reset password</button>
       </form>
}
      {/* New password  */}
        
        {isEmailSent && isOtpSubmited &&

      <form  className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.lock_icon} alt="" className='w-3 h-3' />
          <input onChange={e=> setPassword(e.target.value)} value={password} type="password" placeholder='New password' className='bg-transparent outline-none text-white' required />
        </div>
        <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer mt-3'>Submit</button>
        </form>
}
    </div>
  )
}

export default ResetPassword
