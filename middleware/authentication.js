const { validateToken } = require("../services/authentication");
const User = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue); // { _id, email, ... }

      // ✅ Fetch full user from DB
      const user = await User.findById(userPayload._id);

      if (user) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      console.error("❌ Authentication error:", error.message);
      req.user = null;
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
