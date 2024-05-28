exports.Ownersendtoken = (owner, statusCode, res) => { 
    const Ownertoken = owner.getjwttoken()
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE *24*60*60*1000 
        ),
        // httpOnly: true,
        // res.cookie("jwt", token, {

            secure: true,
            sameSite: "None",
        
        //  });

    }

    res.status(statusCode).cookie("Ownertoken", Ownertoken, options).json({success:true, id: owner._id, Ownertoken})  
    res.json({Ownertoken});
}