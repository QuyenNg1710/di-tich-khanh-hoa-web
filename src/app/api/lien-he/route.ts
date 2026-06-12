import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const DEFAULT_CONTACT_EMAIL = "quyen.nh.64cntt@ntu.edu.vn";

const contactSchema = z.object({
  name: z.string().trim().min(3, "Họ và tên phải có ít nhất 3 ký tự.").max(100),
  email: z.string().trim().email("Hộp thư chưa đúng định dạng email."),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 11;
    }, "Số điện thoại phải có từ 9 đến 11 chữ số."),
  content: z.string().trim().min(10, "Nội dung cần có ít nhất 10 ký tự.").max(5000),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const message = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "Dữ liệu liên hệ không hợp lệ.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.CONTACT_MAIL_FROM || smtpUser;
  const mailTo = process.env.CONTACT_MAIL_TO || DEFAULT_CONTACT_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !mailFrom) {
    return NextResponse.json(
      { message: "Chưa cấu hình SMTP để gửi email. Vui lòng kiểm tra biến môi trường." },
      { status: 503 }
    );
  }

  const { name, email, phone, content } = parsed.data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeContent = escapeHtml(content).replace(/\n/g, "<br />");

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Website Di tích Khánh Hòa" <${mailFrom}>`,
      to: mailTo,
      replyTo: email,
      subject: `Liên hệ từ website - ${name}`,
      text: [`Họ và tên: ${name}`, `Email: ${email}`, `Điện thoại: ${phone}`, "", content].join("\n"),
      html: `
        <h2>Liên hệ từ website Di tích Khánh Hòa</h2>
        <p><strong>Họ và tên:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Điện thoại:</strong> ${safePhone}</p>
        <p><strong>Nội dung:</strong></p>
        <p>${safeContent}</p>
      `,
    });

    return NextResponse.json({ message: "Tin nhắn của bạn đã được gửi đi thành công." });
  } catch (error) {
    console.error("Send contact email error:", error);
    return NextResponse.json({ message: "Không gửi được email. Vui lòng thử lại sau." }, { status: 500 });
  }
}
