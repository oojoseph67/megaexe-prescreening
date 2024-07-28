const bcrypt = require("bcryptjs");

async function hashedPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

async function unHash(requestPassword, databasePassword) {
  const isMatch = await bcrypt.compare(requestPassword, databasePassword);
  return isMatch;
}

module.exports = { hashedPassword, unHash };
