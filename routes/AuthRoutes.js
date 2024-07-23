const { LoginController, LogoutController, SigninController, refreshAccessTokenController } = require( "../controllers/AuthController.js");
const { verifyJWT } = require ("../middleware/AuthMiddleware.js");
const { Router } = require ("express");

const router = Router();

router.post("/signup",SigninController);
router.post("/login",LoginController);
router.post("/logout",verifyJWT,LogoutController);
router.post("/refresh",refreshAccessTokenController);

module.exports = router;