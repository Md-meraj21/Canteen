const {
  createOtp,
  getDb,
  hashOtp,
  json,
  otpExpiry,
  readBody,
  requireMethod,
  sendOtpEmail,
} = require('../_lib/registration');

module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = await readBody(req);
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return json(res, 400, { error: 'Email is required' });
    }

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user || user.emailVerified) {
      return json(res, 400, { error: 'No pending email verification found' });
    }

    const otp = createOtp();

    await sendOtpEmail({
      to: email,
      subject: 'Canteen registration OTP',
      otp,
      purpose: 'registration',
    });

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailOtpHash: hashOtp(otp),
          emailOtpExpires: otpExpiry(),
          updatedAt: new Date(),
        },
      }
    );

    return json(res, 200, { message: 'OTP sent again to your email.' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Could not resend OTP' });
  }
};
