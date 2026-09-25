// Utility function to send error responses in a consistent format
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = { sendError };
