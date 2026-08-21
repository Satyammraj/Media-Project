import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError("Access token is required", 401)
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user){
            //TODO: discuss about frontend
            throw new ApiError("Invalid access token", 401)
        }
    
        req.user = user;
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

    next()



})