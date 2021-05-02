const axios = require("axios");
const sendgridApiKey = `${process.env.SENDGRID_API_KEY}`;
const emailSendUrl = "https://api.sendgrid.com/v3/mail/send";
const EmailType = {
  //  WELCOME_EMAIL: 'd-026a2f461bdd480098be08a2cb949eea',
  CHANGE_PASSWORD: "d-099c03cfa83d46a6a99aa161f58d98de",
  //  OTP: 'd-026a2f461bdd480098be08bxhsyeyyy',
};

module.exports.sendTemplateEmail = (
  fromEmail,
  toEmail,
  replyTo,
  fromName,
  template,
  substitutions,
  attachment
) => {
  if (!EmailType[template]) {
    return Promise.reject(new Error("Template not defined"));
  }
  const email = {
    from: {
      email: fromEmail,
      name: fromName,
    },
    template_id: EmailType[template],
    personalizations: [
      {
        to: [
          {
            email: toEmail,
          },
        ],
        dynamic_template_data: substitutions,
      },
    ],
  };
  if (attachment) {
    email.attachments = attachment;
  }
  if (replyTo) {
    email.reply_to = {
      email: replyTo,
      name: "Reply",
    };
  }
  return axios({
    method: "post",
    url: emailSendUrl,
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
    },
    data: email,
  });
};
