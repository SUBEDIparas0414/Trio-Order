import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { generatePin, sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";

// create a token
const createToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET);
};

// login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.json({ 
        success: false, 
        message: "Please verify your email first. Check your inbox for verification PIN.",
        needsVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = createToken(user._id, user.email);
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, message: "Login failed" });
  }
};

// register
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const exists = await userModel.findOne({ email });

    if (exists) {
      // If user exists but not verified, resend verification
      if (!exists.isVerified) {
        const pin = generatePin();
        exists.verificationPin = pin;
        exists.verificationPinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await exists.save();
        
        await sendVerificationEmail(email, username, pin);
        
        return res.json({ 
          success: false, 
          message: "Account already exists but not verified. A new verification PIN has been sent to your email.",
          needsVerification: true,
          email: email
        });
      }
      return res.json({ success: false, message: "User already exists and is verified. Please login." });
    }

    // validation
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification PIN
    const pin = generatePin();
    const pinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // create new user (not verified yet)
    const newUser = new userModel({
      username: username,
      email: email,
      password: hashedPassword,
      isVerified: false,
      verificationPin: pin,
      verificationPinExpires: pinExpires
    });

    const user = await newUser.save();
    console.log('✅ User saved to database:', user._id);

    // Send verification email
    try {
      await sendVerificationEmail(email, username, pin);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email sending failed but user was created:', emailError);
      // User is created but email failed - still return success so they can try resending
      return res.json({ 
        success: true, 
        message: "Account created! However, email sending failed. Please use 'Resend PIN' option.",
        needsVerification: true,
        email: email
      });
    }

    res.json({ 
      success: true, 
      message: "Registration successful! Please check your email for verification PIN.",
      needsVerification: true,
      email: email
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
};

// Verify email with PIN
const verifyEmail = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Email already verified. Please login." });
    }

    // Check if PIN matches
    if (user.verificationPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN. Please check and try again." });
    }

    // Check if PIN expired
    if (user.verificationPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new verification PIN.",
        expired: true
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationPin = null;
    user.verificationPinExpires = null;
    await user.save();

    // Create token and log them in
    const token = createToken(user._id, user.email);

    res.json({ 
      success: true, 
      message: "Email verified successfully! You can now login.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Resend verification PIN
const resendVerificationPin = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Email not registered" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Email already verified. Please login." });
    }

    // Generate new PIN
    const pin = generatePin();
    user.verificationPin = pin;
    user.verificationPinExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email
    await sendVerificationEmail(email, user.username, pin);

    res.json({ 
      success: true, 
      message: "New verification PIN sent to your email"
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: "Failed to resend verification PIN" });
  }
};

// Request password reset (send PIN to email)
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Email not registered. Please check your email or sign up." });
    }

    if (!user.isVerified) {
      return res.json({ 
        success: false, 
        message: "Please verify your email first before resetting password.",
        needsVerification: true
      });
    }

    // Generate reset PIN
    const pin = generatePin();
    user.resetPin = pin;
    user.resetPinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, user.username, pin);

    res.json({ 
      success: true, 
      message: "Password reset PIN sent to your email",
      email: email
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: "Failed to send password reset PIN" });
  }
};

// Verify reset PIN
const verifyResetPin = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if PIN matches
    if (user.resetPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN" });
    }

    // Check if PIN expired
    if (user.resetPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new reset PIN.",
        expired: true
      });
    }

    res.json({ 
      success: true, 
      message: "PIN verified. You can now reset your password."
    });
  } catch (error) {
    console.error('Verify reset PIN error:', error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Reset password with PIN
const resetPassword = async (req, res) => {
  const { email, pin, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if PIN matches
    if (user.resetPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN" });
    }

    // Check if PIN expired
    if (user.resetPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new reset PIN.",
        expired: true
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset PIN (old password is now invalid)
    user.password = hashedPassword;
    user.resetPin = null;
    user.resetPinExpires = null;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password reset successful! You can now login with your new password."
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationPin,
  requestPasswordReset,
  verifyResetPin,
  resetPassword
};
