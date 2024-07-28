const { sendEmail } = require("./sendEmail");

const sendVerificationEmail = async ({ name, email, token, origin }) => {
  const verificationLink = `${origin}/verify-email?token=${token}&email=${email}`;

  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
            <h1>Email Verification</h1>
            <h2>Hello ${name}</h2>
            <p>Click the link below to verify your email</p>
            <a target="_blank" href="${verificationLink}">Verify Email</a>
        `,
  });
};

module.exports = { sendVerificationEmail };
