const CustomError = require("../errors");
const { verifyJWT, attachCookiesToResponse } = require("../utils/jwt");
const { createTokenUser } = require("../utils/createTokenUser");

const authenticateUser = async (req, res, next) => {
  const { authToken, refreshToken } = req.signedCookies;

  if (!authToken && !refreshToken) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }

  try {
    if (authToken) {
      const verify = verifyJWT(authToken);
      req.user = verify;
      return next();
    }

    const payload = verifyJWT(refreshToken);
    const { userId, refreshToken: payloadRefreshToken, user } = payload.user;
    const existingToken = await Token.findByOne({
      user: userId,
      refreshToken: payloadRefreshToken,
    });

    if (!existingToken || !existingToken.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication invalid");
    }

    attachCookiesToResponse({ res, user, refreshToken: payloadRefreshToken });

    next();
  } catch (error) {
    console.log("authenticateUser error :", error);
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizePermissions = (...roles) => {
  // if (req.user.role !== role) {
  //   throw new CustomError.UnauthorizedError("Unauthorized");
  // }
  return (req, res, next) => {
    if (!roles.includes(req.user.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
