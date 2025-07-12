import User from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { registerSchema } from "../validation";



const register = asyncHandler(async ()=>{

    const validUser = registerSchema.safeParse(req.body)
    if(!validUser.success){
        throw new ApiError(400 , validUser.error.message)
    }

    const {username , email , password , role } = validUser

    const  user = await User.create({
        password,
        username ,
        email,
        role
    }).select("-password -role")


    if(!user) {
        throw new ApiError(400 , "Somthing went wrong while creating user")
    }

    return res.status(200).json(new ApiResponse(200 ,user , "User created successfully" ))
})