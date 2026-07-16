const { Resend } = require("resend");

let resendClient = null;

function getClient() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendEmail({ to, subject, html }) {
  const client = getClient();
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message || error}`);
  }
}

module.exports = sendEmail;
