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

    if (user) {
      const otp = createOtp();

      await sendOtpEmail({
        to: email,
        subject: 'Canteen password reset OTP',
        otp,
        purpose: 'password reset',
      });

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordOtpHash: hashOtp(otp),
            resetPasswordOtpExpires: otpExpiry(),
            updatedAt: new Date(),
          },
        }
      );
    }

    return json(res, 200, { message: 'If this email is registered, a password reset OTP has been sent.' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Could not send password reset OTP' });
  }
};
