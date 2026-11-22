# EmailJS Setup for NexaFlow AI

The contact form uses EmailJS to send enquiries to your email inbox. Follow these steps to activate email delivery:

1. Sign in at [https://www.emailjs.com/](https://www.emailjs.com/) and connect the Gmail inbox where you want to receive enquiries.
2. Create an EmailJS email template using the following variables:
   - `{{name}}`
   - `{{email}}`
   - `{{interest}}`
   - `{{time}}`
   - `{{title}}`
   - `{{message}}`
3. Set the recipient email address to your own Gmail address in the EmailJS template. Set the Reply-To field to `{{email}}`.
4. Copy your Public Key, Service ID, and Template ID from your EmailJS account.
5. Open `script.js` and replace the following placeholders inside `EMAILJS_CONFIG` with your actual EmailJS values:
   - `YOUR_EMAILJS_PUBLIC_KEY`
   - `YOUR_EMAILJS_SERVICE_ID`
   - `YOUR_EMAILJS_TEMPLATE_ID`
6. Save the changes and test the contact form. Check your recipient inbox and spam folder to confirm delivery.

## Security Notes

- Never place your Gmail password, Gmail App Password, or private API keys in frontend JavaScript.
- The EmailJS Public Key is designed for browser-side use.
- Service ID and Template ID are configuration identifiers, not account passwords.
- Configure domain restrictions and spam protection in your EmailJS dashboard where available.
- Keep your EmailJS account credentials private.