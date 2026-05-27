const { getDb, hashOtp, json, readBody, requireMethod } = require('../_lib/registration');

module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = await readBody(req);
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return json(res, 400, { error: 'Email and OTP are required' });
    }

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return json(res, 404, { error: 'Registration not found' });
    }

    if (
      !user.emailOtpHash
      || !user.emailOtpExpires
      || new Date(user.emailOtpExpires).getTime() <= Date.now()
      || user.emailOtpHash !== hashOtp(otp)
    ) {
      return json(res, 400, { error: 'Invalid or expired OTP' });
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          verificationStatus: 'pending',
          updatedAt: new Date(),
        },
        $unset: {
          emailOtpHash: '',
          emailOtpExpires: '',
        },
      }
    );

    return json(res, 200, {
      message: 'Email verified. Your account is waiting for admin verification.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        verificationStatus: 'pending',
        emailVerified: true,
      },
    });
  } catch (error) {
    return json(res, 500, { error: error.message || 'OTP verification failed' });
  }
};
