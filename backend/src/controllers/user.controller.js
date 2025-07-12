import User from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../validation";


const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(process.env.ACCESS_TOKEN_SECRET );

    const accessToken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return  accessToken ;
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while generating Access and Referesh Token "
    );
  }
};
const register = asyncHandler(async () => {
  const validUser = registerSchema.safeParse(req.body);
  if (!validUser.success) {
    throw new ApiError(400, validUser.error.message);
  }

  const { username, email, password, role } = validUser.data;

  const user = await User.create({
    password,
    username,
    email,
    role,
  }).select("-password -role");

  if (!user) {
    throw new ApiError(400, "Somthing went wrong while creating user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User created successfully"));
});

const login = asyncHandler(async (req, res) => {
  const validUser = loginSchema.safeParse(req.body);

  if (!validUser.success) {
    throw new ApiError(400, validUser.error.message);
  }

  const { email, password } = validUser.data;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, " Invalid Credentials");
  }

  const isPasswordVaild = user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new ApiError(400, "Invalid Credentials");
  }

  const  accessToken  = await generateAccessToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).cookie("accessToken", accessToken, option).json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken},
        "User registered successfully"
      )
    );
});

export { register };
