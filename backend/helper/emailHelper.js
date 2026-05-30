import nodemailer from "nodemailer";

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!emailUser || !emailPass) {
    throw new Error("Email credentials are missing in backend/.env.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const getEmailFrom = () =>
  `"MediCore" <${process.env.EMAIL_USER?.trim() || "musmanshahid003@gmail.com"}>`;

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject,
    html,
  });
};

const sendTempPassword = async (email, name, tempPassword) => {
  try {
    await sendEmail({
      to: email,
      subject: "Your Temporary Password",
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your account has been approved.</p>
        <p>Your temporary password is:</p>
        <h3 style="color: blue;">${tempPassword}</h3>
        <p>Please login and change your password immediately.</p>
      `,
    });

    console.log("Temp password email sent successfully");
    return { sent: true };
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return {
      sent: false,
      error: `Could not send temporary password email: ${error.message}`,
    };
  }
};

const sendDoctorRegistrationPassword = async (email, name, tempPassword) => {
  try {
    await sendEmail({
      to: email,
      subject: "Your MediCore Doctor Login Password",
      html: `
        <h2>Welcome Dr. ${name}!</h2>
        <p>Your doctor account registration has been received.</p>
        <p>Your temporary password is:</p>
        <h3 style="color: blue;">${tempPassword}</h3>
        <p>Your account is still pending admin approval. You can login after approval using this password.</p>
      `,
    });

    console.log("Doctor registration password email sent successfully");
    return { sent: true };
  } catch (error) {
    console.error("Doctor password email sending failed:", error.message);
    return {
      sent: false,
      error: `Could not send doctor password email: ${error.message}`,
    };
  }
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Hello ${name}!</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="color: red;">${otp}</h3>
        <p>This OTP is valid for <strong>10 minutes</strong> only.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    console.log("OTP email sent successfully");
    return { sent: true };
  } catch (error) {
    console.error("OTP email sending failed:", error.message);
    return {
      sent: false,
      error: `Could not send OTP email: ${error.message}`,
    };
  }
};

export {
  createTransporter,
  sendTempPassword,
  sendDoctorRegistrationPassword,
  sendOTPEmail,
};
