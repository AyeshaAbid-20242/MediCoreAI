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
const sendZoomLinkEmail = async (email, patientName, doctorName, date, time, zoomLink) => {
  try {
    await sendEmail({
      to: email,
      subject: "Your Consultation Meeting Link — MediCore",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1628; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MediCore</h1>
            <p style="color: #94A3B8; margin: 4px 0 0;">Healthcare Platform</p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0A1628; margin: 0 0 16px;">Your Meeting Link is Ready</h2>
            <p style="color: #64748B;">Dear <strong>${patientName}</strong>,</p>
            <p style="color: #64748B;">Dr. <strong>${doctorName}</strong> has shared a meeting link for your consultation.</p>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 4px; color: #64748B; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Appointment Details</p>
              <p style="margin: 8px 0; color: #0A1628;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 8px 0; color: #0A1628;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 8px 0; color: #0A1628;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            </div>

            <a href="${zoomLink}"
              style="display: block; background: #C8102E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0;">
              Join Meeting
            </a>

            <p style="color: #94A3B8; font-size: 12px; margin: 16px 0 0;">
              Or copy this link: <a href="${zoomLink}" style="color: #C8102E;">${zoomLink}</a>
            </p>

            <p style="color: #94A3B8; font-size: 12px; margin: 16px 0 0;">
              Please join the meeting on time. If you have any issues contact us through MediCore.
            </p>
          </div>
        </div>
      `,
    });
    console.log("Meeting link email sent successfully");
    return { sent: true };
  } catch (error) {
    console.error("Meeting link email failed:", error.message);
    return { sent: false, error: error.message };
  }
};
export {
  createTransporter,
  sendTempPassword,
  sendDoctorRegistrationPassword,
  sendOTPEmail,
  sendZoomLinkEmail,
};
