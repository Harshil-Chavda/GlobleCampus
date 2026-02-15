import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email to the Admin (e.material.study@gmail.com)
    await transporter.sendMail({
      from: `"${name} (GlobalCampus Contact)" <${process.env.SMTP_EMAIL}>`,
      replyTo: email,
      to: "e.material.study@gmail.com",
      subject: `New Message from ${name} 📬`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 20px; color: white;">
            <h2 style="margin: 0;">New Contact Query 💬</h2>
          </div>
          <div style="padding: 30px; background: #fff; color: #334155;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              You received a new message from the GlobalCampus contact form.
            </p>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px; font-weight: 600; color: #64748b;">From:</p>
              <p style="margin: 0; font-size: 18px; color: #0f172a;">${name}</p>
              <a href="mailto:${email}" style="color: #4f46e5;">${email}</a>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px; font-weight: 600; color: #64748b;">Message:</p>
              <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px; font-size: 16px; line-height: 1.6;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
