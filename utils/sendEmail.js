const nodemailer = require("nodemailer");
const nodemailerConfig = require("../utils/nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport(nodemailerConfig);

    let info = await transporter.sendMail({
      from: process.env.FROM_NAME,
      to,
      subject,
      html,
    });

    console.log(info);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };
