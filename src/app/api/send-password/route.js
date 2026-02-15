import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, password, firstName } = await request.json();

    // Create Gmail transporter using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Send email with password and login link
    await transporter.sendMail({
      from: `"GlobleCampus" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "🎓 Welcome to GlobleCampus — Your Login Credentials",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GlobleCampus! 🎓</h1>
            <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Your account has been created successfully</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${firstName || "there"}</strong>,</p>
            <p style="color: #94a3b8; line-height: 1.6;">Your GlobleCampus account is ready! Here are your login credentials:</p>
            
            <div style="background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 12px 0;">
                <strong style="color: #94a3b8;">📧 Email:</strong><br>
                <span style="font-size: 18px; color: white;">${email}</span>
              </p>
              <p style="margin: 0;">
                <strong style="color: #94a3b8;">🔑 Password:</strong><br>
                <span style="font-size: 18px; color: #4f46e5; font-family: monospace; letter-spacing: 1px;">${password}</span>
              </p>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px;">⚠️ Please save this password somewhere safe. You can change it later from your profile settings.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/login" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Login to GlobleCampus →
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(148, 163, 184, 0.2); margin: 30px 0;">
            <p style="color: #64748b; font-size: 12px; text-align: center;">
              This is an automated email from GlobleCampus. If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
