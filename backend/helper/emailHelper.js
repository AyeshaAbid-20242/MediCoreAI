import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendTempPassword = async (email, name, tempPassword) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

const sendDoctorRegistrationPassword = async (email, name, tempPassword) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
  } catch (error) {
    console.error("Doctor password email sending failed:", error.message);
  }
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
  } catch (error) {
    console.error("OTP email sending failed:", error.message);
  }
};

export { sendTempPassword, sendDoctorRegistrationPassword, sendOTPEmail };
