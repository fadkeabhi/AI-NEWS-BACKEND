const { User } = require( "../models/UserModel.js");
const { asyncHandler } = require( "../utils/AsyncHandler.js");
const jwt = require ("jsonwebtoken");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized Access!" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) return res.status(401).json({ error: "Token Expired!" });

    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({message:`Error occured! ${err}`})
  }
});

module.exports = {verifyJWT}