import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req,res,next)=>{
    //get user details from frontend
    //validation - not empty
    //chech if user already exists: usernam, email
    //check for images, avatars
    //upload them to cloudnary, avatar
    //create user object - create entry in db
    //remove password and refresh token from response
    //check fro user creation
    //return response

    const {fullName, email, username, password }=req.body
    console.log("User details from frontend:", {fullName, email, username, password})

    if([fullName, email, username, password].some((field) => field.trim() === "")){
        throw new ApiError("All fields are required", 400)    
    }

    const existedUser =User.findOne({
        $or:[{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError("User already exists", 409)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError("Avatar image is required", 400)
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError("Avatar image upload failed", 400)
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError("User creation failed", 500)
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})


export { registerUser }