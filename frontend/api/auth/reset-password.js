const { bcrypt, getDb, hashOtp, json, readBody, requireMethod } = require('../_lib/registration');

module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = await readBody(req);
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();
    const { password } = body;

    if (!email || !otp || !password) {
      return json(res, 400, { error: 'Email, OTP, and new password are required' });
    }

    if (password.length < 6) {
      return json(res, 400, { error: 'Password must be at least 6 characters' });
    }

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (
      !user
      || !user.resetPasswordOtpHash
      || !user.resetPasswordOtpExpires
      || new Date(user.resetPasswordOtpExpires).getTime() <= Date.now()
      || user.resetPasswordOtpHash !== hashOtp(otp)
    ) {
      return json(res, 400, { error: 'Invalid or expired OTP' });
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: await bcrypt.hash(password, 10),
          updatedAt: new Date(),
        },
        $unset: {
          resetPasswordOtpHash: '',
          resetPasswordOtpExpires: '',
        },
      }
    );

    return json(res, 200, { message: 'Password reset successful. You can login now.' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Password reset failed' });
  }
};
