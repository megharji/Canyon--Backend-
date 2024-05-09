const mongoose = require ("mongoose")

const pgroomModel = new mongoose.Schema({
    owner:
        {type: mongoose.Schema.Types.ObjectId, ref: 'owner'},
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review'
    }],
    ownerName: {
        type: String,
        required: [true, "Owner Name is required"]
    },
    pgName: String,
    location: {
        type: String,
        required: [true, "Room location is required"]
    },
    
    furnished: {
        type: String,
        enum: ["Fully", "Semi", "Unfurnished", "Luxury", "Basic"],
        required: [true, "Room location is required"]
    },
    city:{
        type: String,
        required: [true, "City is required"]
    },
    contact: {
        type: Number,
        required: [true, "Contact is required"],
        maxLength: [10, 'Contact should not exceed more than ten characters'],
        minLength: [10, ' Contact should have at least ten characters']
    },
    altercontact: {
        type: Number,
        required: [true, "Contact is required"],
        maxLength: [10, 'Contact should not exceed more than ten characters'],
        minLength: [10, ' Contact should have at least ten characters']
    },
    tenant:{
        type: String,
        enum: ["Boys", "Girls", "Both"],
        required: [true, "Tenants is required"]
    },
    occupancy:{
        type: String,
        enum: ["Single", "Double", "Triple", "Multiple"],
        required: [true, "Occupancy is required"]
    },
    rent:{
        type: Number,
        required: [true, "Rent is required"]
    },
    vacantBeds:{
        type: Number,
        required: [true, "Vacant Beds is required"]
    },
    bathroomType:{
        type: String,
        enum: ["Attached", "Shared"],
        required: [true, "Bathroom Type is required"]
    },
    balcony:{
        type: String,
        enum: ["Attached", "No", "Shared"],
        required: [true, "Vacant Beds is required"]
    },
    securityDeposit:{
        type: Number,
        required: [true, "Security Deposit is required"]
    },
    noticePeriod:{
        type: Number,
        required: [true, "Notice Period is required"]
    },
    meals:{
        type: String,
        enum: ["Include in rent", "Not Included in rent"],
        required: [true, "Meals / Food is required"]
    },
    availableFrom:{
        type: String,
        required: [true, "Available From is required"]
    },
    kitchen:{
        type: String,
        enum: ["Shared Kitchen", "Private Kitchen", "No Kitchen Access"],
        required: [true, "Vacant Beds is required"]
    },
    entryTiming:{
        type: String,
        required: [true, "Entry Timing is required"]
    },
    girlsEntry:{
        type: String,
        enum: ["Not Allowed", "Allowed"],
        required: [true, "Girls Entry is required"]
    },
    boysEntry:{
        type: String,
        enum: ["Not Allowed", "Allowed"],
        required: [true, "Boys Entry is required"]
    },
    parking:{
        type: String,
        enum: ["Two Wheeler", "Four Wheeler", "Both", "None"],
        required: [true, "Vacant Beds is required"]
    },
    nonVeg:{
        type: String,
        enum: ["Not allowed", "Allowed"],
        required: [true, "Non Veg is allowed or not is required"]
    },
    description: String,
    roompic: { 
        type: Array,
        required: [true, "Room Pic is required"]
    }
},{timestamps:true}
)
const Room = mongoose.model("room", pgroomModel)

module.exports = Room;