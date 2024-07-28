const mongoose = require("mongoose");
const validator = require("validator");
const { hashedPassword } = require("../utils/hash");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
    default: null,
  },
  passwordToken: {
    type: String,
    default: null,
  },
  passwordTokenExpires: {
    type: Date,
    default: null,
  },
});

UserSchema.pre("save", async function (next) {
  this.password = await hashedPassword(this.password);
  next();
});

module.exports = mongoose.model("User", UserSchema);
