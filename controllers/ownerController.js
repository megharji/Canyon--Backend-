const { json } = require("express");
const {catchAsyncErrors} = require("../middlewares/catchAsyncErrors")
const Owner = require("../models/ownerModel")
const Seekers = require("../models/seekersModel")
const Room =  require("../models/pgroomModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { Ownersendtoken } = require("../utils/OwnerSendToken");
const { sendmail } = require("../utils/nodemailer");
const imagekit = require("../utils/imagekit").initImageKit()
const path = require("path");


exports.homepage = catchAsyncErrors( async(req, res, next) => {
    res.json({message: "Secure Owner Homepage"}) 
})

exports.currentOwner = catchAsyncErrors(async (req, res, next)=>{
    const owner = await Owner.findById(req.id).exec()
    res.json({owner})
});

exports.ownerregister = catchAsyncErrors( async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.fullname) {
            return res.status(400).json({ error: 'Email, Fullname and password are required.' });
        }
        const emailExists = await Seekers.exists({ email: req.body.email });
    
        if (emailExists) {
            return res.status(400).json({ error: 'Email is already registered as a Seeker.' });
        }
    
        const existingOwner = await Owner.findOne({ email: req.body.email });
        if (existingOwner) {
            return next(new ErrorHandler("Email is already registered", 400));
        }
    
        const owner = await new Owner(req.body).save()  
        Ownersendtoken(owner, 201 , res)
    } catch (err) {
        
        return res.status(400).json({ error: err.message });
    }
})

exports.ownersignin = catchAsyncErrors( async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        const owner = await Owner.findOne({email:req.body.email}) 
            .select("+password")
            .exec()   
       
        if(!owner) 
            return next(
                new ErrorHandler("User not found With this email address. Fill a valid email address", 404) 
            );
        const isMatch = owner.comparePassword(req.body.password)  
        if(!isMatch){
             return next(new ErrorHandler("Wrong password", 500))
        }
        Ownersendtoken(owner, 200, res)
    } catch (error) {
        return res.status(400).json({ error: err.message });   
    }
})

exports.ownersignout = catchAsyncErrors( async (req, res, next) => {
    res.clearCookie("Ownertoken")
    res.json({message:"Successfully signout"})
})

exports.ownersendmail = catchAsyncErrors(async (req, res, next)=>{
    const owner = await Owner.findOne({email:req.body.email}).exec()

    if(!owner) 
        return next(
            new ErrorHandler("User not found With this email address", 404)   
        );

    const otp = Math.floor(100000 + Math.random() * 900000);

    owner.resetPasswordToken = otp;
    await owner.save();
    
    res.status(200).json({ message: 'OTP has been sent to your email successfully', ownerId: owner._id, email: req.body.email });


    sendmail(req,res,next,otp)
});


exports.ownerforgetlink = catchAsyncErrors( async(req, res, next) => {
    try {
        const owner = await Owner.findById(req.params.id).exec();

        if(!owner) 
            return next(
                new ErrorHandler("User not found With this email address", 404)  
            );

        if (owner.resetPasswordToken === req.body.otp) {
            owner.password = req.body.password;
            owner.resetPasswordToken = "0";
            await owner.save(); 

            res.status(200).json({
                
                message: "Password has been successfully changed",
            });
        } else {
            return next(new ErrorHandler("Invalid OTP! Please try again.", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.ownerresetpassword = catchAsyncErrors( async(req, res, next) => {
   
    const owner = await Owner.findById(req.id).exec();
    
    owner.password = req.body.password
    await owner.save() 
   
    Ownersendtoken(owner, 201 , res)  

})


//--------------------------------pgRoom-------------------------


exports.createpgroom = catchAsyncErrors(async (req, res, next) => {
    const owner = await Owner.findById(req.id).exec();
    if (!owner) {
        return res.status(404).json({ success: false, message: "Owner not found" });
    }


    const room = new Room({
        owner: owner._id,
        ownerName: req.body.ownerName,
        pgName: req.body.pgName,
        location: req.body.location,
        furnished: req.body.furnished,
        city: req.body.city,
        contact: req.body.contact,
        altercontact: req.body.altercontact,
        tenant: req.body.tenant,
        occupancy: req.body.occupancy,
        rent: req.body.rent,
        vacantBeds: req.body.vacantBeds,
        bathroomType: req.body.bathroomType,
        balcony: req.body.balcony,
        securityDeposit: req.body.securityDeposit,
        noticePeriod: req.body.noticePeriod,
        meals: req.body.meals,
        availableFrom: req.body.availableFrom,
        kitchen: req.body.kitchen,
        entryTiming: req.body.entryTiming,
        girlsEntry: req.body.girlsEntry,
        boysEntry: req.body.boysEntry,
        parking: req.body.parking,
        nonVeg: req.body.nonVeg,
        description: req.body.description,
        roompic: [] 
    });

    try {
        const files = Array.isArray(req.files.roompic) ? req.files.roompic : [req.files.roompic];
        const uploadedImages = [];

        
        for (const file of files) {
            if (file) { 
                const modifiedFieldName = `roompic-${Date.now()}${path.extname(file.name)}`;
                

                const { fileId, url } = await imagekit.upload({
                    file: file.data,
                    fileName: modifiedFieldName,
                });

                uploadedImages.push({ fileId, url });
            }
        }

        room.roompic = uploadedImages;

        await room.save();
        owner.pgroom.push(room._id);
        await owner.save();
        res.status(201).json({ success: true, room });
    } catch (error) {
        console.error("Error in createpgroom:", error);
        res.status(500).json({ success: false, message: "Error creating pg room", error });
    }

});


exports. readpgroom = catchAsyncErrors( async(req, res, next) => {         
    const {pgroom} = await Owner.findById(req.id).populate("pgroom").exec()  
    res.status(200).json({success:true, pgroom})
})




exports.deletepgroom = async (req, res, next) => {
    try {
        await Room.findByIdAndDelete(req.params.roomid);
        res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete room",
        });
    }
};



exports.updatepgroom = catchAsyncErrors(async (req, res, next) => {
    const { roomId } = req.params;

    try {
        const room = await Room.findById(roomId).exec();
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Update room fields
        room.ownerName = req.body.ownerName || room.ownerName;
        room.pgName = req.body.pgName || room.pgName;
        room.location = req.body.location || room.location;
        room.furnished = req.body.furnished || room.furnished;
        room.city = req.body.city || room.city;
        room.contact = req.body.contact || room.contact;
        room.altercontact = req.body.altercontact || room.altercontact;
        room.tenant = req.body.tenant || room.tenant;
        room.occupancy = req.body.occupancy || room.occupancy;
        room.rent = req.body.rent || room.rent;
        room.vacantBeds = req.body.vacantBeds || room.vacantBeds;
        room.bathroomType = req.body.bathroomType || room.bathroomType;
        room.balcony = req.body.balcony || room.balcony;
        room.securityDeposit = req.body.securityDeposit || room.securityDeposit;
        room.noticePeriod = req.body.noticePeriod || room.noticePeriod;
        room.meals = req.body.meals || room.meals;
        room.availableFrom = req.body.availableFrom || room.availableFrom;
        room.kitchen = req.body.kitchen || room.kitchen;
        room.entryTiming = req.body.entryTiming || room.entryTiming;
        room.girlsEntry = req.body.girlsEntry || room.girlsEntry;
        room.boysEntry = req.body.boysEntry || room.boysEntry;
        room.parking = req.body.parking || room.parking;
        room.nonVeg = req.body.nonVeg || room.nonVeg;
        room.description = req.body.description || room.description;

        // Append new images to existing roompic array
        if (req.files && req.files.roompic) {
            const files = Array.isArray(req.files.roompic) ? req.files.roompic : [req.files.roompic];
            const uploadedImages = [];

            for (const file of files) {
                if (file) { 
                    // Upload image using imagekit
                    const modifiedFieldName = `roompic-${Date.now()}${path.extname(file.name)}`;
                    const { fileId, url } = await imagekit.upload({
                        file: file.data,
                        fileName: modifiedFieldName,
                    });
                    uploadedImages.push({ fileId, url });
                }
            }

            room.roompic = [...room.roompic, ...uploadedImages]; // Append new images
        }

        await room.save();

        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error("Error in updatepgroom:", error);
        res.status(500).json({ success: false, message: "Error updating PG room", error });
    }
});

exports.deleteRoomPic = catchAsyncErrors(async (req, res, next) => {
    const { roomId, fileId } = req.params; // Adjusted to fileId
    
    try {
        const room = await Room.findById(roomId).exec();

        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const index = room.roompic.findIndex(pic => pic.fileId === fileId); // Adjusted to fileId

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Picture not found" });
        }

        
        room.roompic.splice(index, 1);

        
        await room.save();

        
        res.status(200).json({ success: true, message: "Room picture deleted successfully" });
    } catch (error) {
      
        console.error("Error deleting room picture:", error);
        res.status(500).json({ success: false, message: "Error deleting room picture", error });
    }
});
