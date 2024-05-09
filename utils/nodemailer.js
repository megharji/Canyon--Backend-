const nodemailer = require("nodemailer")
const ErorrHandler = require("./ErrorHandler")
const Seekers = require("../models/seekersModel")

exports.sendmail = (req,res,next,otp) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        post: 465,
        auth:{
            user: process.env.MAIL_EMAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    })

    const mailOptions = {
        from: "Megha Private Limited",
        to: req.body.email,
        subject: "Password Reset OTP",
        html: `<h1>Your OTP for resetting password is: ${otp}</h1>
               <p>This OTP is valid for 5 minutes. Do not share this OTP with anyone.</p>`,
    }

    transport.sendMail(mailOptions, (err,info) => {
        if (err) return next(new ErorrHandler(err, 500))
        console.log(info);
    

    })
} 