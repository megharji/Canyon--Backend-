const mongoose = require ("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const ownerModel = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Fullname is required"],
        minLength: [4, 'Fullname should have at least four characters'],

    },
    email:{ 
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        select: false,   
        required: [true, "Password is required"],
        maxLength: [15, 'Password should not exceed more than fifteen characters'],
        minLength: [6, 'Password should have at least 6 characters'],
        // match : []
    },
    resetPasswordToken: {
        type: String,
        default: "0",
        ref: "owner" 
 
    },
    pgroom:[
        {type: mongoose.Schema.Types.ObjectId, ref: 'room'}
    ],
    owner: {
        type: Boolean,
        default: true
    }
   
},{timestamps:true})

ownerModel.pre("save", function() {    
    if(!this.isModified("password")){  
        return
    }
    let salt = bcrypt.genSaltSync(10) 
    this.password = bcrypt.hashSync(this.password, salt)  
}) 

ownerModel.methods.comparePassword = function (password) {
   return bcrypt.compareSync(password, this.password)  
}

ownerModel.methods.getjwttoken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{  
        expiresIn: process.env.JWT_EXPIRE,
    }) 
}

const Seekers = mongoose.model("owner", ownerModel)

module.exports = Seekers;