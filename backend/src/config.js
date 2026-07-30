function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET es obligatorio en producción.");
  }
  return secret || "development-only-secret";
}

module.exports = { getJwtSecret };
