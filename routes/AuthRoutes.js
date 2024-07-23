const { LoginController, LogoutController, SigninController, refreshAccessTokenController } = require( "../controllers/AuthController.js");
const { verifyJWT } = require ("../Middleware/AuthMiddleware.js");
const { Router } = require ("express");

const router = Router();

router.post("/signin",SigninController);
router.post("/login",LoginController);
router.post("/logout",verifyJWT,LogoutController);
router.post("/refresh",refreshAccessTokenController);

module.exports = router;