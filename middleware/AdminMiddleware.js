const { User } = require( "../models/UserModel.js");
const { asyncHandler } = require( "../utils/AsyncHandler.js");
const jwt = require ("jsonwebtoken");

const adminVerify = asyncHandler(async (req, res, next) => {
    try {
        const token = req.query.token;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized Access!" });
        }

        if (token !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ error: "Unauthorized Access!" });
        }

        req.user = { isAdmin: true };

        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: `Error occurred! ${err}` });
    }
});

module.exports = {adminVerify}