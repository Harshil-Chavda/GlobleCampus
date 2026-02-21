import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const {
      user_email,
      user_name,
      subject,
      course,
      topic,
      urgency,
      description,
    } = await request.json();

    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPass = process.env.SMTP_PASSWORD?.trim();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpEmail,
        pass: smtpPass,
      },
    });

    // Formatting urgency color
    const getUrgencyColor = (u) => {
      if (u === "urgent") return "#ef4444"; // red
      if (u === "normal") return "#f59e0b"; // yellow
      return "#22c55e"; // green
    };

    // Send email to Admin
    await transporter.sendMail({
      from: `"${user_name} (Premium Pro)" <${process.env.SMTP_EMAIL}>`,
      replyTo: user_email,
      to: "e.material.study@gmail.com",
      subject: `[Premium Query] ${subject} - ${topic} 👑`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; color: #0f172a;">
            <h2 style="margin: 0;">👑 New Premium Pro Query</h2>
          </div>
          <div style="padding: 30px; background: #fff; color: #334155;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              A Premium Pro user has submitted a new support query.
            </p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 15px;"><strong>From:</strong> ${user_name} (<a href="mailto:${user_email}" style="color: #4f46e5;">${user_email}</a>)</p>
              <p style="margin: 0 0 8px; font-size: 15px;"><strong>Course:</strong> ${course || "N/A"}</p>
              <p style="margin: 0 0 8px; font-size: 15px;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 0 0 8px; font-size: 15px;"><strong>Topic:</strong> ${topic}</p>
              <p style="margin: 0; font-size: 15px;">
                <strong>Urgency:</strong> 
                <span style="color: ${getUrgencyColor(urgency)}; font-weight: bold; text-transform: capitalize;">${urgency}</span>
              </p>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px; font-weight: 600; color: #64748b;">Query Details:</p>
              <div style="background: #fff; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 16px; line-height: 1.6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${description.replace(/\n/g, "<br>")}
              </div>
            </div>

            <p style="font-size: 13px; color: #94a3b8; margin-top: 30px; text-align: center;">
              Reply directly to this email to respond to <strong>${user_name}</strong>.
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Premium query email error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
