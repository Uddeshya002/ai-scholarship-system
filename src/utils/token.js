const crypto = require("crypto");

const APP_SECRET = process.env.APP_SECRET || "change-this-secret";
const TOKEN_EXPIRY_HOURS = Number(process.env.TOKEN_EXPIRY_HOURS || 10);

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signToken(payload) {
  const body = {
    ...payload,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  };

  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signature = toBase64Url(
    crypto.createHmac("sha256", APP_SECRET).update(encodedPayload).digest()
  );

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  const [encodedPayload, receivedSignature] = String(token || "").split(".");

  if (!encodedPayload || !receivedSignature) {
    throw new Error("Invalid token format.");
  }

  const expectedSignature = toBase64Url(
    crypto.createHmac("sha256", APP_SECRET).update(encodedPayload).digest()
  );

  if (expectedSignature !== receivedSignature) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));

  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error("Token has expired.");
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
};

