import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerSchema } from "../validation/index.js";

const register = asyncHandler(async (req, res) => {
    const validUser = registerSchema.safeParse(req.body)
    if(!validUser.success){
        throw new ApiError(400 , validUser.error.message)
    }

    const {username , email , password , role } = validUser.data

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

export { register };