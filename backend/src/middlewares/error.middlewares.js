import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal server error.";
    err.statusCode = err.statusCode || 500;
  
    if (err.name === "JsonWebTokenError") {
      const message = "Json web token is invalid, Try again.";
      err = new ApiError(400,message);
    }
    if (err.name === "TokenExpiredError") {
      const message = "Json web token is expired, Try again.";
      err = new ApiError(400,message);
    }
    if (err.name === "CastError") {
      const message = `Invalid ${err.path}`;
      err = new ApiError(400,message);
    }
  
    const errorMessage = err.errors
      ? Object.values(err.errors)
          .map((error) => error.message)
          .join(" ")
      : err.message;
  
    return res.status(err.statusCode).json(new ApiResponse(err.statusCode, err,errorMessage));
  };
  