const {
  bcrypt,
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
    const { name, email, username, phone, password, militaryId, rank } = body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim().toLowerCase();

    if (!name || !normalizedEmail || !normalizedUsername || !phone || !password) {
      return json(res, 400, { error: 'Name, username, email, phone, and password are required' });
    }

    const db = await getDb();
    const users = db.collection('users');
    const existingUser = await users.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser && existingUser.emailVerified) {
      return json(res, 400, {
        error: existingUser.email === normalizedEmail ? 'Email already registered' : 'Username already taken',
      });
    }

    if (existingUser && existingUser.email !== normalizedEmail) {
      return json(res, 400, { error: 'Username already taken' });
    }

    const otp = createOtp();
    const now = new Date();
    const userDoc = {
      name,
      email: normalizedEmail,
      username: normalizedUsername,
      phone,
      password: await bcrypt.hash(password, 10),
      militaryId: militaryId || null,
      rank: rank || null,
      idCardImage: body.idCardImage || null,
      emailVerified: false,
      verificationStatus: 'email_unverified',
      emailOtpHash: hashOtp(otp),
      emailOtpExpires: otpExpiry(),
      updatedAt: now,
    };

    if (!existingUser) {
      userDoc.role = 'user';
      userDoc.avatar = null;
      userDoc.verificationNotes = null;
      userDoc.verifiedBy = null;
      userDoc.verifiedAt = null;
      userDoc.isActive = true;
      userDoc.createdAt = now;
    }

    await sendOtpEmail({
      to: normalizedEmail,
      subject: 'Canteen registration OTP',
      otp,
      purpose: 'registration',
    });

    await users.updateOne(
      existingUser ? { _id: existingUser._id } : { email: normalizedEmail },
      { $set: userDoc },
      { upsert: true }
    );

    return json(res, 201, {
      message: 'OTP sent to your email. Verify it to submit your account for admin approval.',
      email: normalizedEmail,
    });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Registration failed' });
  }
};
