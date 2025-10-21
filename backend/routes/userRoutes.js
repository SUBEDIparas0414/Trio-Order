import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationPin,
  requestPasswordReset,
  verifyResetPin,
  resetPassword
} from "../controllers/userController.js";

const userRouter = express.Router();

// Authentication routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Email verification routes
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verification", resendVerificationPin);

// Password reset routes
userRouter.post("/forgot-password", requestPasswordReset);
userRouter.post("/verify-reset-pin", verifyResetPin);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
