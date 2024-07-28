const crypto = require("crypto");
const User = require("../models/user");
const Token = require("../models/token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { unHash, hashedPassword } = require("../utils/hash");
const { attachCookiesToResponse } = require("../utils/jwt");
const { createTokenUser } = require("../utils/createTokenUser");
const { sendVerificationEmail } = require("../utils/sendVerficiationEmail");
const { sendResetPasswordEmail } = require("../utils/sendRestPasswordEmail");

const { UnauthenticatedError, BadRequestError } = CustomError;

const origin = process.env.FRONTEND_URL;

const login = async (req, res) => {
  const { body } = req;
  const { email, password: requestPassword } = body;

  if (!email || !requestPassword) {
    throw new BadRequestError("Please provide both email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const {
    _id: userId,
    name: checkedName,
    email: checkedUserEmail,
    password: databasePassword,
    role,
  } = user;

  const isMatch = await unHash(requestPassword, databasePassword);
  if (!isMatch) {
    throw new UnauthenticatedError("Wrong Password");
  }

  if (!user.isVerified) {
    throw new BadRequestError("Please verify your account");
  }

  // const tokenUser = { userId, name: checkedName, role };
  const tokenUser = createTokenUser(user);

  let refreshToken = "";

  const existingToken = await Token.findOne({ user: userId });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res.status(StatusCodes.OK).json({
      msg: `user exists with name ${checkedName}`,
      user: { checkedName, checkedUserEmail },
    });

    return;
  }

  refreshToken = crypto.randomBytes(20).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  const userToken = {
    refreshToken,
    ipAddress: ip,
    userAgent,
    user: userId,
    isValid: true,
  };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({
    msg: `user exists with name ${checkedName}`,
    user: { checkedName, checkedUserEmail },
  });
};

const register = async (req, res) => {
  const { body } = req;
  const { name, email, password } = body;

  // checking email
  const emailCheck = await User.findOne({ email });
  if (emailCheck) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // registering the first user as an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(20).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    msg: `user created with name ${name}`,
    notice: "please check your email to verify your account",
    user: { name, email },
  });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.user.userId });

  res.cookie("authToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const verifyEmail = async (req, res) => {
  // const { verificationToken, email } = req.body;
  const { token, email } = req.query;

  if (!token) {
    throw new BadRequestError("Provide a verification token");
  }

  if (!email) {
    throw new BadRequestError("Provide an email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError(`No user found with email ${email}`);
  }

  if (user.isVerified) {
    throw new BadRequestError(`Email ${email} is already verified`);
  }

  if (user.verificationToken !== token) {
    throw new UnauthenticatedError("Invalid verification token");
  }

  await User.findByIdAndUpdate(user._id, {
    isVerified: true,
    verified: new Date(),
    verificationToken: "",
  });

  res.status(StatusCodes.OK).json({ msg: "Email verified" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError(`No user found with email ${email}`);
  }

  const passwordToken = crypto.randomBytes(50).toString("hex");
  const passwordTokenExpires = new Date(Date.now() + 1000 * 60 * 10);

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    passwordToken,
    passwordTokenExpires,
  });

  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    token: passwordToken,
    expires: passwordTokenExpires,
    origin,
  });

  res.status(StatusCodes.OK).json({
    msg: "Password reset link sent to your email",
  });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email) {
    throw new BadRequestError("Provide a password token and email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError(`No user found with email ${email}`);
  }

  if (user.passwordToken !== token) {
    throw new UnauthenticatedError("Invalid password token");
  }

  if (user.passwordTokenExpires < currentDate) {
    throw new BadRequestError("Password token expired");
  }

  if (!password) {
    throw new BadRequestError("Provide a password");
  }

  const currentDate = new Date();

  user.password = password;
  user.passwordToken = null;
  user.passwordTokenExpires = null;
  user.save();
};

module.exports = {
  login,
  register,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
