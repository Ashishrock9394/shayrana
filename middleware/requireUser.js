module.exports = (req, res, next) => {
      if (!req.user) {
            // User is not authenticated
            return res.status(401).render('signin', {
            error: "You must be signed in to access this page."
            });
      }
      // User is authenticated, proceed
      next();
};
    