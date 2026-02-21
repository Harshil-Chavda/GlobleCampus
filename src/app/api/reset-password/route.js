import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPass) {
      console.error("❌ SMTP Credentials missing in environment variables");
      return Response.json(
        { error: "Server misconfiguration: Missing email credentials" },
        { status: 500 }
      );
    }

    // Use service role key to update user password
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single();

    if (!profile) {
      // Don't reveal if email exists or not for security
      return Response.json({ success: true });
    }

    // Generate new password
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const special = "!@#$%&*";
    const all = upper + lower + nums + special;
    let newPassword = "";
    newPassword += upper[Math.floor(Math.random() * upper.length)];
    newPassword += lower[Math.floor(Math.random() * lower.length)];
    newPassword += nums[Math.floor(Math.random() * nums.length)];
    newPassword += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 12; i++) {
      newPassword += all[Math.floor(Math.random() * all.length)];
    }
    newPassword = newPassword
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    // Update password in Supabase Auth using admin API
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Password update error:", updateError);
      return Response.json(
        { error: "Failed to reset password" },
        { status: 500 },
      );
    }

    // Send new password via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await transporter.sendMail({
      from: `"GlobleCampus" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "🔑 Your New GlobleCampus Password",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          
          <div style="background: linear-gradient(135deg, #dc2626, #f97316); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset 🔑</h1>
            <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Your password has been reset successfully</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${profile.first_name || "there"}</strong>,</p>
            <p style="color: #94a3b8; line-height: 1.6;">You requested a password reset. Here are your new login credentials:</p>
            
            <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 12px 0;">
                <strong style="color: #94a3b8;">📧 Email:</strong><br>
                <span style="font-size: 18px; color: white;">${email}</span>
              </p>
              <p style="margin: 0;">
                <strong style="color: #94a3b8;">🔑 New Password:</strong><br>
                <span style="font-size: 18px; color: #f97316; font-family: monospace; letter-spacing: 1px;">${newPassword}</span>
              </p>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px;">⚠️ Please save this password and change it from Settings after logging in.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/login" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Login to GlobleCampus →
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(148, 163, 184, 0.2); margin: 30px 0;">
            <p style="color: #64748b; font-size: 12px; text-align: center;">
              If you didn't request this reset, please contact support immediately.
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
