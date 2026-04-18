export function authenticate(req, res, next) {
  next();
}

export function requireRole(role) {
  return (req, res, next) => next();
}