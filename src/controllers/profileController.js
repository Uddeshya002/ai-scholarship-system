const pool = require("../config/database");
const { emailExistsElsewhere } = require("./authController");
const { hashSecret, normalizeAnswer, verifySecret } = require("../utils/security");

async function getProfile(req, res) {
  if (req.user.role === "student") {
    const [rows] = await pool.query(
      `SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          dob,
          roll_no,
          gender,
          category,
          annual_income,
          address_line,
          city,
          state,
          postal_code,
          security_question,
          is_verified
        FROM students
        WHERE id = ?
        LIMIT 1`,
      [req.user.id]
    );

    if (!rows[0]) {
      res.status(404).json({ message: "Student profile not found." });
      return;
    }

    const profile = rows[0];
    res.json({
      profile: {
        id: profile.id,
        role: "student",
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob,
        rollNo: profile.roll_no,
        gender: profile.gender,
        category: profile.category,
        annualIncome: Number(profile.annual_income || 0),
        addressLine: profile.address_line,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postal_code,
        securityQuestion: profile.security_question,
        isVerified: Boolean(profile.is_verified),
      },
    });
    return;
  }

  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        email,
        phone,
        security_question
      FROM admins
      WHERE id = ?
      LIMIT 1`,
    [req.user.id]
  );

  if (!rows[0]) {
    res.status(404).json({ message: "Admin profile not found." });
    return;
  }

  const profile = rows[0];
  res.json({
    profile: {
      id: profile.id,
      role: "admin",
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      securityQuestion: profile.security_question,
    },
  });
}

async function updateProfile(req, res) {
  const normalizedEmail = String(req.body.email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    res.status(400).json({ message: "Email is required." });
    return;
  }

  if (await emailExistsElsewhere(normalizedEmail, req.user.role, req.user.id)) {
    res.status(409).json({ message: "This email is already used by another account." });
    return;
  }

  if (req.user.role === "student") {
    const {
      firstName,
      lastName,
      phone,
      dob,
      rollNo,
      gender,
      category,
      annualIncome,
      addressLine,
      city,
      state,
      postalCode,
    } = req.body;

    if (!firstName || !lastName || !phone) {
      res.status(400).json({ message: "First name, last name, and phone are required." });
      return;
    }

    await pool.query(
      `UPDATE students
       SET first_name = ?, last_name = ?, phone = ?, email = ?, dob = ?, roll_no = ?,
           gender = ?, category = ?, annual_income = ?, address_line = ?, city = ?,
           state = ?, postal_code = ?
       WHERE id = ?`,
      [
        firstName.trim(),
        lastName.trim(),
        phone.trim(),
        normalizedEmail,
        dob || null,
        rollNo || null,
        gender || null,
        category || null,
        annualIncome ? Number(annualIncome) : 0,
        addressLine || null,
        city || null,
        state || null,
        postalCode || null,
        req.user.id,
      ]
    );
  } else {
    const { fullName, phone } = req.body;

    if (!fullName || !phone) {
      res.status(400).json({ message: "Full name and phone are required." });
      return;
    }

    await pool.query(
      "UPDATE admins SET full_name = ?, phone = ?, email = ? WHERE id = ?",
      [fullName.trim(), phone.trim(), normalizedEmail, req.user.id]
    );
  }

  res.json({ message: "Profile updated successfully." });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: "Current password and new password are required." });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ message: "New password must be at least 8 characters long." });
    return;
  }

  const tableName = req.user.role === "student" ? "students" : "admins";
  const [rows] = await pool.query(`SELECT password_hash FROM ${tableName} WHERE id = ? LIMIT 1`, [
    req.user.id,
  ]);

  if (!rows[0] || !verifySecret(currentPassword, rows[0].password_hash)) {
    res.status(400).json({ message: "Current password is incorrect." });
    return;
  }

  const passwordHash = hashSecret(newPassword);
  await pool.query(`UPDATE ${tableName} SET password_hash = ? WHERE id = ?`, [
    passwordHash,
    req.user.id,
  ]);

  res.json({ message: "Password updated successfully." });
}

async function updateSecurityQuestion(req, res) {
  const { currentPassword, securityQuestion, securityAnswer } = req.body;

  if (!currentPassword || !securityQuestion || !securityAnswer) {
    res.status(400).json({
      message: "Current password, security question, and security answer are required.",
    });
    return;
  }

  const tableName = req.user.role === "student" ? "students" : "admins";
  const [rows] = await pool.query(`SELECT password_hash FROM ${tableName} WHERE id = ? LIMIT 1`, [
    req.user.id,
  ]);

  if (!rows[0] || !verifySecret(currentPassword, rows[0].password_hash)) {
    res.status(400).json({ message: "Current password is incorrect." });
    return;
  }

  await pool.query(
    `UPDATE ${tableName}
     SET security_question = ?, security_answer_hash = ?
     WHERE id = ?`,
    [securityQuestion.trim(), hashSecret(normalizeAnswer(securityAnswer)), req.user.id]
  );

  res.json({ message: "Security question updated successfully." });
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateSecurityQuestion,
};

