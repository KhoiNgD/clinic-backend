const sgMail = require("@sendgrid/mail");
const pug = require("pug");
const sendgridApiKey =
  "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";
sgMail.setApiKey(sendgridApiKey);
// sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);
// em4126.fpt.edu.vn
// const msg = {
//   to: "khoindct123@gmail.com",
//   from: "khoindct123@gmail.com", // Use the email address or domain you verified above
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };

module.exports.sendPasswordReset = async (user, url) => {
  const html = pug.renderFile(`${__dirname}/../views/email/passwordReset.pug`, {
    name: user.name,
    subject: "Your password reset token (valid for only 10 minutes)",
    url,
  });

  const msg = {
    to: user.email,
    from: "khoindct123@gmail.com", // Use the email address or domain you verified above
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};
