const pool = require("../config/database");

function formatAdminApplication(application) {
  return {
    id: application.id,
    applicationNo: application.application_no,
    studentName: application.student_name,
    studentEmail: application.student_email,
    isVerified: Boolean(application.is_verified),
    scholarshipName: application.scholarship_name,
    amount: Number(application.amount || 0),
    status: application.status,
    paymentStatus: application.payment_status || "not-started",
    transactionRef: application.transaction_ref,
    notes: application.notes,
    documentPath: application.document_path,
    submittedAt: application.created_at,
    reviewedAt: application.reviewed_at,
  };
}

async function getDashboard(req, res) {
  const [applicationCounts] = await pool.query(
    `SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingApplications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedApplications,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedApplications,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paidApplications
      FROM applications`
  );

  const [studentCounts] = await pool.query(
    `SELECT
        COUNT(*) AS totalStudents,
        SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) AS unverifiedStudents
      FROM students`
  );

  const [scholarshipCounts] = await pool.query(
    `SELECT
        COUNT(*) AS totalScholarships,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS openScholarships
      FROM scholarships`
  );

  const [recentApplications] = await pool.query(
    `SELECT
        a.id,
        a.application_no,
        a.status,
        a.notes,
        a.document_path,
        a.created_at,
        a.reviewed_at,
        st.is_verified,
        CONCAT(st.first_name, ' ', st.last_name) AS student_name,
        st.email AS student_email,
        sc.name AS scholarship_name,
        sc.amount,
        p.payment_status,
        p.transaction_ref
      FROM applications a
      JOIN students st ON st.id = a.student_id
      JOIN scholarships sc ON sc.id = a.scholarship_id
      LEFT JOIN payments p ON p.application_id = a.id
      ORDER BY a.created_at DESC
      LIMIT 6`
  );

  res.json({
    summary: {
      pendingApplications: Number(applicationCounts[0].pendingApplications || 0),
      approvedApplications: Number(applicationCounts[0].approvedApplications || 0),
      rejectedApplications: Number(applicationCounts[0].rejectedApplications || 0),
      paidApplications: Number(applicationCounts[0].paidApplications || 0),
      totalStudents: Number(studentCounts[0].totalStudents || 0),
      unverifiedStudents: Number(studentCounts[0].unverifiedStudents || 0),
      totalScholarships: Number(scholarshipCounts[0].totalScholarships || 0),
      openScholarships: Number(scholarshipCounts[0].openScholarships || 0),
    },
    recentApplications: recentApplications.map(formatAdminApplication),
  });
}

async function listStudents(_req, res) {
  const [rows] = await pool.query(
    `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        roll_no,
        category,
        annual_income,
        city,
        state,
        is_verified,
        created_at
      FROM students
      ORDER BY created_at DESC`
  );

  res.json({
    students: rows.map((item) => ({
      id: item.id,
      fullName: `${item.first_name} ${item.last_name}`.trim(),
      email: item.email,
      phone: item.phone,
      rollNo: item.roll_no,
      category: item.category,
      annualIncome: Number(item.annual_income || 0),
      city: item.city,
      state: item.state,
      isVerified: Boolean(item.is_verified),
      createdAt: item.created_at,
    })),
  });
}

async function listApplications(_req, res) {
  const [rows] = await pool.query(
    `SELECT
        a.id,
        a.application_no,
        a.status,
        a.notes,
        a.document_path,
        a.created_at,
        a.reviewed_at,
        st.is_verified,
        CONCAT(st.first_name, ' ', st.last_name) AS student_name,
        st.email AS student_email,
        sc.name AS scholarship_name,
        sc.amount,
        p.payment_status,
        p.transaction_ref
      FROM applications a
      JOIN students st ON st.id = a.student_id
      JOIN scholarships sc ON sc.id = a.scholarship_id
      LEFT JOIN payments p ON p.application_id = a.id
      ORDER BY a.created_at DESC`
  );

  res.json({
    applications: rows.map(formatAdminApplication),
  });
}

async function createScholarship(req, res) {
  const {
    name,
    amount,
    description,
    eligibilityCriteria,
    category,
    maxIncome,
    deadline,
    status,
  } = req.body;

  if (!name || !amount || !description || !eligibilityCriteria) {
    res.status(400).json({
      message: "Scholarship name, amount, description, and eligibility are required.",
    });
    return;
  }

  const [result] = await pool.query(
    `INSERT INTO scholarships (
      name,
      amount,
      description,
      eligibility_criteria,
      category,
      max_income,
      deadline,
      status,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      Number(amount),
      description.trim(),
      eligibilityCriteria.trim(),
      category || null,
      maxIncome ? Number(maxIncome) : null,
      deadline || null,
      status || "open",
      req.user.id,
    ]
  );

  res.status(201).json({
    message: "Scholarship created successfully.",
    scholarshipId: result.insertId,
  });
}

async function verifyStudent(req, res) {
  const studentId = Number(req.params.id);
  const { isVerified } = req.body;

  await pool.query("UPDATE students SET is_verified = ? WHERE id = ?", [
    isVerified ? 1 : 0,
    studentId,
  ]);

  res.json({ message: "Student verification updated successfully." });
}

async function updateApplicationStatus(req, res) {
  const applicationId = Number(req.params.id);
  const status = String(req.body.status || "").trim().toLowerCase();
  const notes = String(req.body.notes || "").trim();

  if (!["pending", "approved", "rejected", "paid"].includes(status)) {
    res.status(400).json({ message: "Invalid application status." });
    return;
  }

  const [applicationRows] = await pool.query(
    `SELECT
        a.id,
        a.scholarship_id,
        sc.amount
      FROM applications a
      JOIN scholarships sc ON sc.id = a.scholarship_id
      WHERE a.id = ?
      LIMIT 1`,
    [applicationId]
  );

  if (!applicationRows[0]) {
    res.status(404).json({ message: "Application not found." });
    return;
  }

  await pool.query(
    `UPDATE applications
     SET status = ?, notes = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ?`,
    [status, notes || null, req.user.id, applicationId]
  );

  const scholarshipAmount = Number(applicationRows[0].amount || 0);

  if (status === "approved") {
    await pool.query(
      `INSERT INTO payments (application_id, amount, payment_status, remarks)
       VALUES (?, ?, 'pending', ?)
       ON DUPLICATE KEY UPDATE
         amount = VALUES(amount),
         payment_status = 'pending',
         remarks = VALUES(remarks),
         processed_at = NULL`,
      [applicationId, scholarshipAmount, "Application approved. Payment is pending."]
    );
  }

  if (status === "paid") {
    const transactionRef = `TXN-${Date.now()}`;
    await pool.query(
      `INSERT INTO payments (
         application_id,
         amount,
         payment_status,
         transaction_ref,
         processed_at,
         remarks
       ) VALUES (?, ?, 'processed', ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE
         amount = VALUES(amount),
         payment_status = 'processed',
         transaction_ref = VALUES(transaction_ref),
         processed_at = NOW(),
         remarks = VALUES(remarks)`,
      [applicationId, scholarshipAmount, transactionRef, "Scholarship payment processed."]
    );
  }

  if (status === "rejected") {
    await pool.query(
      `INSERT INTO payments (application_id, amount, payment_status, remarks)
       VALUES (?, ?, 'failed', ?)
       ON DUPLICATE KEY UPDATE
         amount = VALUES(amount),
         payment_status = 'failed',
         remarks = VALUES(remarks),
         transaction_ref = NULL,
         processed_at = NULL`,
      [applicationId, scholarshipAmount, "Application rejected. Payment is cancelled."]
    );
  }

  res.json({ message: "Application status updated successfully." });
}

module.exports = {
  getDashboard,
  listStudents,
  listApplications,
  createScholarship,
  verifyStudent,
  updateApplicationStatus,
};

