const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

exports.isAuthenticates = catchAsyncErrors(async (req, res, next) => {
    const {token} = req.cookies;    
    if (!token) {
            return next(new ErrorHandler("Please login to access the resources", 401));
    }
    

    const { id } = jwt.verify(token, process.env.JWT_SECRET); 
    req.id =  id; 
    next(); 

});



exports.isOwnerAuthenticates = catchAsyncErrors(async (req, res, next) => {
    const {Ownertoken} = req.cookies;  
    if (!Ownertoken) {
            return next(new ErrorHandler("Please login to access the resources", 401));
    }
    

    const { id } = jwt.verify(Ownertoken, process.env.JWT_SECRET); 
    req.id =  id;  
    next(); 
    
});