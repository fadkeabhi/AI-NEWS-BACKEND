const { User } = require("../models/UserModel.js");
const { asyncHandler } = require("../utils/AsyncHandler.js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendOtpEmail, sendResetEmail } = require("../utils/email.js");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById({ _id: userId });
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err);
  }
};




const SigninController = async (req, res) => {
  const { email, lastName, firstName, phone, password } = req.body;

  try {
    const userCheck = await User.findOne({ email: email });


    if (userCheck) {
      // if no otp expiry then user is verified
      if (!userCheck.otpExpiry) {
        return res.status(409).json({ error: "User already exists!" });
      }
      // Check if OTP was requested within the last 10 minutes
      if (userCheck.otpExpiry && userCheck.otpExpiry > Date.now()) {
        return res.status(429).json({ error: "OTP request too soon. Please wait a few minutes before trying again." });
      }

      // OTP is expired, generate a new OTP and update expiry
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

      userCheck.otp = otp;
      userCheck.otpExpiry = otpExpiry;
      await userCheck.save();

      await sendOtpEmail(email, firstName, otp);

      return res.status(201).json({
        status: "success",
        message: "New OTP sent to your email. Please verify.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password,
      role: "user",
      otp,
      otpExpiry
    });

    await sendOtpEmail(email, firstName, otp);

    res.status(201).json({
      status: "success",
      message: "OTP sent to your email. Please verify.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error occurred!" });
  }
};

const OtpRegenerateController = async (req, res) => {
  const { email } = req.body;

  try {
    const userCheck = await User.findOne({ email: email });


    if (userCheck) {
      // if no otp expiry then user is verified
      if (!userCheck.otpExpiry) {
        return res.status(409).json({ error: "User already verified!" });
      }
      // Check if OTP was requested within the last 10 minutes
      if (userCheck.otpExpiry && userCheck.otpExpiry > Date.now()) {
        return res.status(429).json({ error: "OTP request too soon. Please wait a few minutes before trying again." });
      }

      // OTP is expired, generate a new OTP and update expiry
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

      userCheck.otp = otp;
      userCheck.otpExpiry = otpExpiry;
      await userCheck.save();

      await sendOtpEmail(email, firstName, otp);

      return res.status(201).json({
        status: "success",
        message: "New OTP sent to your email. Please verify.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error occurred!" });
  }
};


const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    if (!user?.otp) {
      return res.status(200).json({ message: "User Already Verified" });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    // OTP is valid, clear the OTP and OTP expiry
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully!",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error occurred!" });
  }
};

const testverifyOtpController = async (req, res) => {
  await sendOtpEmail("fadkeabhi@gmail.com", "Abhishek", "123456");
  res.json({ msg: "send" })
};



const LoginController = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Credentials error!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not registered!" });
    }

    const isPassCorrectValid = await user.isPasswordCorrect(password);

    if (!isPassCorrectValid) {
      return res.status(401).json({ error: "Password invalid!" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id.toString()
    );

    const loggedInUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    // TO make cookie modifiable by server only we use following code
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error occured!" });
  }
});

const LogoutController = asyncHandler(async (req, res) => {
  const id = req.user._id;

  await User.findByIdAndUpdate(id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out!" });
});

const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (!incomingRefreshToken)
      return res.status(401).json({ message: "Unauthorized request!" });

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user)
      return res.status(401).json({ message: "Invalid refresh token!" });

    if (incomingRefreshToken !== user?.refreshToken)
      return res.status(401).json({ message: "Refresh token expired!" });

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        accessToken,
        refreshToken,
        message: "Access Token refreshed!",
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error occured!" });
  }
});

const requestPasswordResetController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if there is already a token that is not expired
  if (user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
    return res.status(429).json({ message: 'Password reset email already sent. Please check your email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY);
  await user.save();

  await sendResetEmail(email, token);

  res.status(200).json({ message: 'Password reset email sent' });
};

module.exports = { refreshAccessTokenController, LoginController, LogoutController, SigninController, verifyOtpController, OtpRegenerateController, testverifyOtpController, requestPasswordResetController };