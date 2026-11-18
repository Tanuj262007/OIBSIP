# EmailJS setup for NexaFlow AI

The contact form uses EmailJS. To activate email delivery:

1. Sign in at https://www.emailjs.com/ and connect the Gmail inbox that should receive enquiries.
2. Create an EmailJS template with `{{from_name}}`, `{{reply_to}}`, `{{interest}}`, and `{{message}}`.
3. Set the recipient to your own Gmail address in the EmailJS template. Set Reply-To to `{{reply_to}}`.
4. Copy the Public Key, Service ID and Template ID from EmailJS.
5. In `script.js`, replace these placeholders in `EMAILJS_CONFIG`:
   - `YOUR_EMAILJS_PUBLIC_KEY`
   - `YOUR_EMAILJS_SERVICE_ID`
   - `YOUR_EMAILJS_TEMPLATE_ID`
6. Save and test the form. Check the recipient inbox and spam folder.

Never place a Gmail password or private API key in frontend JavaScript. The EmailJS public key is designed to be used in browser code.
