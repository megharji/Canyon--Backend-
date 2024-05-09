const {catchAsyncErrors} = require("../middlewares/catchAsyncErrors")
const Seekers = require("../models/seekersModel")
const ErrorHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");
const { sendmail } = require("../utils/nodemailer");
const { json } = require("express");
const Owner = require("../models/ownerModel")
const imagekit = require("../utils/imagekit").initImageKit()
const path = require("path");
const Room =  require("../models/pgroomModel");
const bcrypt = require("bcryptjs")
const  Review = require('../models/reviewModel');
const { log } = require("console");
const crypto = require('crypto');


exports.homepage = catchAsyncErrors( async(req, res, next) => {
    const allRoom = await Room.find().populate('owner', 'firstname');
    res.json({message: "Secure Seekers Homepage", allRoom}) 
})

exports.currentSeekers = catchAsyncErrors(async (req, res, next)=>{
    const seekers = await Seekers.findById(req.id).exec()
    res.json({seekers})
});

exports.seekersregister = catchAsyncErrors( async (req, res, next) => {
    try{
        if (!req.body.email || !req.body.password || !req.body.fullname) {
            return res.status(400).json({ error: 'Email, Fullname and password are required.' });
        }
        const emailExists = await Owner.exists({ email: req.body.email });
        
        if (emailExists) {
            return res.status(400).json({ error: 'Email is already registered as a Owner.' });
        }   
        
        const existingSeeker = await Seekers.findOne({ email: req.body.email });
        if (existingSeeker) {
            return next(new ErrorHandler("Email is already registered", 400));
        }
        const seekers = await new Seekers(req.body).save()  
        sendtoken(seekers, 201 , res)
    }catch(err){
        return res.status(400).json({ error: err.message });
    }

        

})

exports.seekerssignin = catchAsyncErrors( async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        
        const seekers = await Seekers.findOne({email:req.body.email}) 
            .select("+password")
            .exec()   
            if (!seekers) {
                return next(new ErrorHandler("User not found With this email address. Fill a valid email address", 400));
            }
        const isMatch = seekers.comparePassword(req.body.password)  
        if(!isMatch) {
            return next(new ErrorHandler("Wrong password", 400))
        }
        sendtoken(seekers, 200, res)
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

exports.seekerssignout = catchAsyncErrors( async (req, res, next) => {
    res.clearCookie("token")
    res.json({message:"Successfully signout"})
})





exports.seekerssendmail = catchAsyncErrors(async (req, res, next) => {
    const seekers = await Seekers.findOne({ email: req.body.email }).exec();
   
    if (!seekers)
        return next(new ErrorHandler("User not found with this email address", 404));

    const otp = Math.floor(100000 + Math.random() * 900000); 
  

    seekers.resetPasswordToken = otp;
    await seekers.save();

    res.status(200).json({ message: 'OTP has been sent to your email successfully', userId: seekers._id, email: req.body.email });

    sendmail(req, res, next, otp);
});



exports.seekersforgetlink = async (req, res, next) => {
    try {
        const seekers = await Seekers.findById(req.params.id).exec();

        if (!seekers)
            return next(new ErrorHandler("User not found with this ID", 404));

        if (seekers.resetPasswordToken === req.body.otp) {
            seekers.password = req.body.password;
            seekers.resetPasswordToken = "0";
            await seekers.save(); 

            res.status(200).json({
                
                message: "Password has been successfully changed",
            });
        } else {
            return next(new ErrorHandler("Invalid OTP! Please try again.", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};




exports.seekersresetpassword = catchAsyncErrors( async(req, res, next) => {
   
    const seekers = await Seekers.findById(req.id).exec();
    
    seekers.password = req.body.password
    await seekers.save() 
   
    sendtoken(seekers, 201 , res)  

})

exports.seekersaddreview = catchAsyncErrors(async (req, res, next) => {       
    try {
        const { text } = req.body;
        const { roomId } = req.params;
        const createdBy = req.id;

        const createdByUser = await Seekers.findById(req.id);

        if (!createdByUser) {
            return next(new ErrorHandler('User not found', 404));
        }
        
        const review = new Review({
            text,
            createdBy,
            roomId, 
            createdAt: new Date(),
            fullname: createdByUser.fullname,
        });


        await review.save();

        const room = await Room.findById(roomId);
        if (!room) {
            return next(new ErrorHandler('Room not found', 404));
        }
        
        room.reviews.push(review._id);
        await room.save();
       
        const createdAtDate = review.createdAt.toISOString().substring(0, 10).split("-").reverse().join("-");

        const response = {
            reviewId : review._id,
            text: review.text,
            fullname: createdByUser.fullname, 
            createdAt: createdAtDate,
            userId: createdBy 
        };
        

        res.status(201).json({ message: 'Review added successfully', review: response });
    } catch (error) {
        console.error('Error in adding review:', error);
        next(new ErrorHandler('Server error', 500));
    }
});


exports.getAllRoomReviews = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId).populate('reviews');

        if (!room) {
            return next(new ErrorHandler('Room not found', 404));
        }

        res.status(200).json({ reviews: room.reviews });
    } catch (error) {
        console.error('Error in getting room reviews:', error);
        next(new ErrorHandler('Server error', 500));
    }
        
};



exports.seekersDeleteReview = async (req, res, next) => {
    try {
        const { roomId, reviewId } = req.params;
        const userId = req.id; 
        const review = await Review.findById(reviewId);
        if (!review) {
            return next(new ErrorHandler('Review not found', 404));
        }

        if (review.createdBy.toString() !== userId) {
            return next(new ErrorHandler('You are not authorized to delete this review', 403));
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return next(new ErrorHandler('Room not found', 404));
        }

        const index = room.reviews.indexOf(reviewId);
        if (index !== -1) {
            room.reviews.splice(index, 1);
        }

        await room.save();

        await Review.findByIdAndDelete(reviewId); 

        res.status(200).json({userId,reviewId, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error in deleting review:', error);
        next(new ErrorHandler('Server error', 500));
    }
};


