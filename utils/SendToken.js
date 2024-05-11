exports.sendtoken = (seekers, statusCode, res) => {
    const token = seekers.getjwttoken()
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE *24*60*60*1000 
        ),
        httpOnly: true,

       
    }

    res.status(statusCode).cookie("token", token, options).json({success:true, id: seekers._id, token})  
    res.json({token});
}