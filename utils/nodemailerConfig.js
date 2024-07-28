module.exports = {
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
