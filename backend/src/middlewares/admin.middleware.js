export const adminMiddleware = (req, res, next) => {
  const isAdmin = req.user.isAdmin;

  if (!isAdmin) {
    return res.status(401).json({
      success: false,
      message: "Admin access denied",
    });
  }

  next();
};
