const express = require("express")
const router = express.Router()

const { 
    homepage,
    currentSeekers, 
    seekersregister,
    seekerssignin,
    seekerssignout,
    seekerssendmail,
    seekersforgetlink,
    seekersresetpassword,
    seekersaddreview,
    getAllRoomReviews,
    seekersDeleteReview
} = require("../controllers/indexController")

const { isAuthenticates } = require("../middlewares/auth")

//get
router.get("/", homepage)

//post/seekers
router.post("/seekers", isAuthenticates, currentSeekers)  

//post/seekers/register
router.post("/seekers/register", seekersregister)


//post/seekers/signin
router.post("/seekers/signin", seekerssignin)


//get/seekers/signout
router.get("/seekers/signout",isAuthenticates, seekerssignout)

//post/seekers/send-mail
router.post("/seekers/send-mail", seekerssendmail)

//get/seekers/forget-link/:seekersid
router.post("/seekers/forget-link/:id", seekersforgetlink)

//post/seekers/reset-password
router.post("/seekers/reset-password",isAuthenticates, seekersresetpassword)

//post/seekers/add-review
router.post("/seekers/profile/:roomId/add-review",isAuthenticates, seekersaddreview)

//get/seekers/profile/:roomId/reviews
router.get("/seekers/profile/:roomId/reviews", getAllRoomReviews)

//delete/seekers/profile/:roomId/delete-review/:reviewId
router.delete("/seekers/profile/:roomId/delete-review/:reviewId", isAuthenticates, seekersDeleteReview);

module.exports = router