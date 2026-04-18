import db from "../config/database.js";

export function register(req, res) {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    securityQuestion,
    securityAnswer,
  } = req.body;

  db.query(
    `INSERT INTO students 
    (first_name, last_name, email, phone, password_hash, security_question, security_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone, password, securityQuestion, securityAnswer],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Registration failed" });
      }

      res.json({ message: "Registered successfully" });
    }
  );
}