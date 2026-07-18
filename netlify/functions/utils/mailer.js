const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "gargmohit8302@gmail.com",
    pass: "bfhp btbs liog spmm",
  },
});

async function sendEmail({ to, subject, html, attachments }) {
  const mailOptions = {
    from: `"Vyas Finserv" <gargmohit8302@gmail.com>`,
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

module.exports = { sendEmail };
