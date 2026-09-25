// function to extract the Bearer token from the Authorization header of a request
function getAuthToken(req) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7);
}
// function to normalize an array of values, removing empty or whitespace-only items
function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item && item.toString().trim());
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

module.exports = { getAuthToken, normalizeArray };
