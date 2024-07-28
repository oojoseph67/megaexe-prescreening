const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingeUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/userController");

// router.route("/").get(auth, authorizePermissions, getAllUsers);
router.get("/", authenticateUser, authorizePermissions('admin'), getAllUsers);

router.get("/me", authenticateUser, showCurrentUser);
router.patch(
  "/updateUser",
  authenticateUser,
  //   authorizePermissions,
  updateUser
);
router.patch(
  "/updateUserPassword",
  authenticateUser,
  //   authorizePermissions,
  updateUserPassword
);

router.get("/:id", authenticateUser, getSingeUser);

module.exports = router;
