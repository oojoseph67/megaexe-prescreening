const { sendEmail } = require("./sendEmail");

const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  expires,
  origin,
}) => {
  const verificationLink = `${origin}/forgot-password?token=${token}&email=${email}`;

  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
                <h1>Email Verification</h1>
                <h2>Hello ${name}</h2>
                ${expires ? `<p> Link will expire in ${expires} </p>` : ""}
                <p>Click the link below to verify your email</p>
                <a target="_blank" href="${verificationLink}">Verify Email</a>
            `,
  });
};

module.exports = { sendResetPasswordEmail };
