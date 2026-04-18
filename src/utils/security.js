const crypto = require("crypto");

function hashSecret(secret) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifySecret(secret, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const comparisonHash = crypto.scryptSync(secret, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(originalHash, "hex"),
    Buffer.from(comparisonHash, "hex")
  );
}

function normalizeAnswer(answer) {
  return String(answer || "").trim().toLowerCase();
}

module.exports = {
  hashSecret,
  verifySecret,
  normalizeAnswer,
};

