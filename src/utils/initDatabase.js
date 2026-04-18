const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function splitStatements(sqlText) {
  const withoutBlockComments = sqlText.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutLineComments
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  const statements = splitStatements(sql);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const schemaPath = path.join(__dirname, "..", "..", "..", "database", "schema.sql");
  const seedPath = path.join(__dirname, "..", "..", "..", "database", "seed.sql");

  await runSqlFile(connection, schemaPath);
  await runSqlFile(connection, seedPath);

  await connection.end();
  console.log("Database schema and seed data applied successfully.");
}

main().catch((error) => {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
});

