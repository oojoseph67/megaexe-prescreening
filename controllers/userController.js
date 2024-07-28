const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { unHash, hashedPassword } = require("../utils/hash");
const { createTokenUser } = require("../utils/createTokenUser");
const { cookies } = require("../utils/jwt");
const { checkPermissions } = require("../utils/checkPermissions");

const { CustomAPIError, UnauthenticatedError, NotFoundError, BadRequestError } =
  CustomError;

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingeUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new NotFoundError(`No user with id ${id}`);
  }
  
  checkPermissions(req.user, user);

  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { user } = req.user;
  const { newName, newEmail } = req.body;

  if (!newName && !newEmail) {
    throw new BadRequestError("Please provide newName or newEmail");
  }

  const userQuery = await User.findById(user.userId);

  if (!userQuery) {
    throw new NotFoundError(`No user with id ${user.userId}`);
  }

  const newUser = await User.findByIdAndUpdate(
    user.userId,
    { name: newName, email: newEmail },
    { new: true, runValidators: true }
  );

  const tokenUser = createTokenUser(user);
  cookies({ res, user: tokenUser });

  res
    .status(StatusCodes.OK)
    .json({
      msg: `Update to profile of id: ${userId} was successful`,
      newUser,
    });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { user } = req.user;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError(
      "Please provide both oldPassword and newPassword"
    );
  }

  const userQuery = await User.findById(user.userId);

  if (!userQuery) {
    throw new NotFoundError(`No user with id ${user.userId}`);
  }

  const isMatch = await unHash(oldPassword, user.password);

  if (!isMatch) {
    throw new UnauthenticatedError("Wrong Password");
  }

  if (oldPassword === newPassword) {
    throw new BadRequestError(
      "Old password and new password cannot be the same"
    );
  }

  const hashedPass = await hashedPassword(newPassword);

  await User.findByIdAndUpdate(user.userId, { password: hashedPass }, { new: true });

  res.status(StatusCodes.OK).json({ msg: "Password Updated" });
};
const deleteUser = async (req, res) => {
  res.send("delete user");
};

module.exports = {
  getAllUsers,
  getSingeUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  deleteUser,
};
