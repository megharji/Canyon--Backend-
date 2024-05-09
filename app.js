require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();

require("./models/database").connectDatabase();

// Logger middleware
const logger = require("morgan");
app.use(logger("tiny"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Session middleware
const session = require("express-session");
const cookieparser = require("cookie-parser")   
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(cookieparser())

// File upload middleware
const fileupload = require("express-fileupload");
app.use(fileupload());


const cors = require("cors");
app.use(cors({ credentials: true, origin: true }));

// Routes
app.use("/", require("./routes/indexRoutes"));
app.use("/owner", require("./routes/ownerRoutes"));

// Error handling
const ErrorHandler = require("./utils/ErrorHandler");
const { generatedErrors } = require("./middlewares/errors");
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found ${req.url} `, 404));
});

app.use(generatedErrors);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
