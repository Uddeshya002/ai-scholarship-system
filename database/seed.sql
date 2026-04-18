USE scholarship_management_system;

INSERT INTO admins (
    full_name,
    email,
    phone,
    password_hash,
    security_question,
    security_answer_hash
) VALUES (
    'System Admin',
    'admin@scholarhub.local',
    '9876543210',
    '571d2686a3f81ec4d34d9382b8ad2488:7254deab380fbf949c4f2a3d51043fc58227724d005e7122887fb54359054387c7a783358e7b21e1ec338026d79ba9b1594978749eeee92751e11bd890c39d1a',
    'What is your favourite color?',
    '8b001e26bd219e5ebf691ec3e06842d1:cd27bc074dc188b981e45312613b80a7b8fbb131056e49a96c1d674581e054d19ceed4860e4576b8d869270e7d5c9d1542d742fd561ca433d256b724d124bbb1'
) ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    phone = VALUES(phone);

INSERT INTO students (
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
    password_hash,
    security_question,
    security_answer_hash,
    is_verified
) VALUES (
    'Uddeshya',
    'Sharma',
    'student@scholarhub.local',
    '9123456789',
    '2004-06-12',
    'IT2026001',
    'Male',
    'General',
    180000,
    '34 Knowledge Park, Civil Lines',
    'Lucknow',
    'Uttar Pradesh',
    '226001',
    '890a23aea92da83db183da8e6f4f9fe5:ffaa8669fae6505ea9e3eb1c33312fba732fa27aafa7fa9bb8392867c98ff5d13467a8f3f7aeb50bf9d53044c90564d0ca7d5e32fe22e05d458dba756a1ce6f9',
    'In which city were you born?',
    '4addb9323c1fdf4fb359fa982764e734:11a9f5d55fcea63162555adc7c31b8265bc12832f5ce7b94d26ec23b73f49d0e548ac4606b6983729a301bfc78c5ed883731778f32da7cf225fa41e9eb4e83ba',
    1
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    phone = VALUES(phone),
    annual_income = VALUES(annual_income),
    is_verified = VALUES(is_verified);

INSERT INTO scholarships (
    name,
    amount,
    description,
    eligibility_criteria,
    category,
    max_income,
    deadline,
    status,
    created_by
) VALUES
(
    'Merit Excellence Scholarship',
    50000,
    'Supports high-performing undergraduate students with tuition and academic resource assistance.',
    'Minimum 75 percent in previous qualifying exam. Open to undergraduate students with strong academic performance.',
    'General',
    300000,
    '2026-07-30',
    'open',
    (SELECT id FROM admins WHERE email = 'admin@scholarhub.local')
),
(
    'Girl Empowerment Grant',
    40000,
    'Financial support for female students continuing higher education in technical or professional courses.',
    'Open to female students enrolled in diploma, degree, or professional courses with valid income proof.',
    'Female',
    250000,
    '2026-08-15',
    'open',
    (SELECT id FROM admins WHERE email = 'admin@scholarhub.local')
),
(
    'Rural Talent Scholarship',
    35000,
    'Encourages meritorious students from rural backgrounds to continue their studies without financial pressure.',
    'Student must belong to a rural area and submit proof of residence along with the application.',
    'Rural',
    200000,
    '2026-09-01',
    'open',
    (SELECT id FROM admins WHERE email = 'admin@scholarhub.local')
),
(
    'Technical Innovation Scholarship',
    60000,
    'Rewards students in engineering and technology programs who demonstrate innovation and project involvement.',
    'Open to B.Tech, BCA, MCA, and related students. Project or technical portfolio is preferred.',
    'Open',
    400000,
    '2026-08-31',
    'open',
    (SELECT id FROM admins WHERE email = 'admin@scholarhub.local')
) ON DUPLICATE KEY UPDATE
    amount = VALUES(amount),
    description = VALUES(description),
    eligibility_criteria = VALUES(eligibility_criteria),
    category = VALUES(category),
    max_income = VALUES(max_income),
    deadline = VALUES(deadline),
    status = VALUES(status),
    created_by = VALUES(created_by);

INSERT INTO applications (
    application_no,
    student_id,
    scholarship_id,
    income_details,
    document_path,
    status,
    notes,
    reviewed_by
)
SELECT
    'APP-2026-0001',
    st.id,
    sc.id,
    'Family annual income is INR 1,80,000. Income certificate and ID proof have been prepared for verification.',
    '/uploads/demo-income-certificate.pdf',
    'pending',
    'Waiting for admin review.',
    NULL
FROM students st
JOIN scholarships sc ON sc.name = 'Merit Excellence Scholarship'
WHERE st.email = 'student@scholarhub.local'
AND NOT EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.application_no = 'APP-2026-0001'
);
