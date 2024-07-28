const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  //   console.log(requestUser);
  //   console.log(resourceUserId);
  //   console.log(typeof resourceUserId);
  if (requestUser.user.role === "admin") return;
  if (requestUser.user.userId !== resourceUserId.toString()) {
    throw new CustomError.UnauthorizedError(
      "Unauthorized to access this route"
    );
  }
};

module.exports = { checkPermissions };
