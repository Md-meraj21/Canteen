# Email OTP Authentication Setup

Backend `.env` me ye values bharni hain:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_email@gmail.com
```

`SMTP_USER` aur `SMTP_FROM` me wahi Gmail address daalo jisse OTP emails bhejni hain.

`SMTP_PASS` me normal Gmail password nahi chalega. Gmail ke liye Google Account me 2-Step Verification on karke **App Password** generate karo, wahi 16-character app password yahan daalo.

Flow:

1. User registration form fill karega.
2. OTP original email par jayega.
3. OTP verify hone ke baad account admin verification queue me jayega.
4. Admin approve karega.
5. User login kar paayega.
6. Forgot password me bhi email OTP se password reset hoga.
