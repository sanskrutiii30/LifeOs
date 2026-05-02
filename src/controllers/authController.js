const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// register 
exports.register = asyncHandler(async (req, res)=> {

    const {name , email , password} = req.body;

    if(!email || !password){
         throw new AppError("Email and password Required",400);
    }

    if(!email.includes("@")){
        throw new AppError("Invalid Email",400);
    }
    
    //check existing user 
    const userExists = await pool.query("select * from users WHERE email = $1",[email]);

    if(userExists.rows.length > 0){
            throw new AppError("User already exist",400);
    }

    //haspassword 
    const hasPassword = await bcrypt.hash(password,10);

    //insert user 
    await pool.query("Insert into users (name, email, password) VALUES ($1, $2, $3)", [name, email,hasPassword]);

    res.json({success : true , message : "User Registered Successfully" , data : {email}});

});

//login
exports.login = asyncHandler(async (req , res) =>{
   
    const {email, password} = req.body;

    console.log(req.body);
    
    if(!email.includes("@")){
        throw new AppError("Invalid Email",400);
    }

    if(!email || !password){
         throw new AppError("Email and password Required",400);
    }

    const result = await pool.query("select * from users where email = $1",[email]);

    if(result.rows.length == 0){
        throw new AppError("User not found, check credentials",404);
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new AppError("Invalid Password, Retry",400)
    }

    //create token 
    const token = jwt.sign(
        { userId: user.id }, // UUID column
            process.env.JWT_SECRET,
                    { expiresIn: "7d" });

    res.json({success : true , message : "Login Success" , data : {token}});
});
