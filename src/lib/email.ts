import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER || "mdeasinarafat016456@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "waql bfpw tumq crvi";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendRegistrationEmail(
  toEmail: string,
  toName: string,
  username: string,
  passwordPlanText: string
) {
  const mailOptions = {
    from: `"ModManager System" <${SMTP_USER}>`,
    to: toEmail,
    subject: "ModManager Account Registered - Pending Approval",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #8b5cf6; margin-bottom: 20px;">Welcome to ModManager, ${toName}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Your moderator account application has been submitted successfully and is currently <strong>Pending Admin Approval</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Here are your login credentials (please save them securely):
        </p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 14px;">
          <p style="margin: 0 0 8px 0;"><strong>Username / User ID:</strong> ${username}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${passwordPlanText}</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          An administrator will review your application soon. Once approved, you can log in using these credentials.
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This is an automated system email. Please do not reply directly.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(toEmail: string, toName: string, resetLink: string) {
  const mailOptions = {
    from: `"ModManager System" <${SMTP_USER}>`,
    to: toEmail,
    subject: "Reset Your Password - ModManager",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #8b5cf6; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Hello ${toName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          We received a request to reset your password for your ModManager account. Click the button below to set a new password:
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
          If the button above does not work, copy and paste the following link into your web browser:
        </p>
        <p style="font-size: 12px; font-family: monospace; background-color: #f1f5f9; padding: 10px; border-radius: 6px; word-break: break-all;">
          ${resetLink}
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          This reset link is valid for 1 hour. If you did not request this reset, you can ignore this email.
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This is an automated system email. Please do not reply directly.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
