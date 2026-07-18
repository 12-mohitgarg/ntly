import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "gargmohit8302@gmail.com",
    pass: "bfhp btbs liog spmm",
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string; // base64 string
    encoding?: string;
  }[];
}) {
  const mailOptions = {
    from: `"Internmitra" <gargmohit8302@gmail.com>`,
    to,
    subject,
    html,
    attachments: attachments?.map((att) => ({
      filename: att.filename,
      content: att.content,
      encoding: "base64",
    })),
  };

  return transporter.sendMail(mailOptions);
}
