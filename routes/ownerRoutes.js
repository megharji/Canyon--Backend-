const express = require("express")
const router = express.Router()

const { 
    homepage,
    currentOwner, 
    ownerregister,
    ownersignin,
    ownersignout,
    ownersendmail,
    ownerforgetlink,
    ownerresetpassword,
    createpgroom,
    readpgroom,
    deletepgroom,
    updatepgroom,
    deleteRoomPic
} = require("../controllers/ownerController")

const { isOwnerAuthenticates } = require("../middlewares/auth")

//get
router.get("/", homepage)

//post/owner/currentowner
 router.post("/currentowner", isOwnerAuthenticates, currentOwner)  

//post/owner/register
router.post("/register", ownerregister)

//post/owner/signin
router.post("/signin", ownersignin)

//get/owner/signout
router.get("/signout",isOwnerAuthenticates, ownersignout)

//post/owner/send-mail
router.post("/send-mail", ownersendmail)

//post/owner/forget-link/:ownerid
router.post("/forget-link/:id", ownerforgetlink)

//post/owner/reset-password/:ownerid
router.post("/reset-password", isOwnerAuthenticates, ownerresetpassword)



//--------------------------------pgRoom-------------------------

//POST/owner/pgroom/create
router.post("/pgroom/create", isOwnerAuthenticates, createpgroom)

//POST/owner/pgroom/read
router.post("/pgroom/read",isOwnerAuthenticates, readpgroom)

//delete/owner/pgroom/delete/:roomid
router.delete("/pgroom/delete/:roomid",isOwnerAuthenticates, deletepgroom)

//post/owner/pgroom/update/:roomid
router.post("/pgroom/update/:roomId",isOwnerAuthenticates, updatepgroom)

//get/owner/pgroom/deletepic/:roomId/:picId
router.get("/pgroom/:roomId/update/delete/:fileId", isOwnerAuthenticates, deleteRoomPic);


module.exports = router