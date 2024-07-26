const { LoginController, LogoutController, SigninController, refreshAccessTokenController, verifyOtpController, testverifyOtpController, OtpRegenerateController, requestPasswordResetController, healthCheck } = require( "../controllers/AuthController.js");
const { verifyJWT } = require ("../middleware/AuthMiddleware.js");
const { Router } = require ("express");

const router = Router();

router.post("/signup",SigninController);
router.post('/verify-otp', verifyOtpController);
router.post('/otp-regenerate', OtpRegenerateController);
router.post("/login",LoginController);
router.post("/logout",verifyJWT,LogoutController);
router.post("/refresh",refreshAccessTokenController);
router.get("/test",testverifyOtpController);
router.get("/health",verifyJWT,healthCheck);

router.post("/forget-password",requestPasswordResetController);

module.exports = router;