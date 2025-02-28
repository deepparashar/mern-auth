import jwt from 'jsonwebtoken'

const userAuth = async (req,res,next) => {
  const {token} = req.cookies;

  if(!token){
    return res.json({msg: 'Not authorized.login again'});
  }
 try {
    
 const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET)

 if(tokenDecoded.id){
    req.body.userId = tokenDecoded.id
 }else{
    return res.json({success:false,msg: 'Not authorized.login again'});
 }
  next()
 } catch (error) {
     return res.json({success:false,msg:error.msg});
 }

}

export default userAuth;