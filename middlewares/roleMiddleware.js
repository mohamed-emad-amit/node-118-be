// Check Role User
function roleMiddleware(...roles) {
  return (requset, response, next) => {
    const userRole = requset.user.role;

    if (!userRole) {
      return response.status(401).json({ message: "unauthorized" });
    }

    const isExist = roles.includes(userRole);
    if (!isExist) {
      return response.status(403).json({ message: "Access Denied" });
    }

    next();
  };
}

module.exports = { roleMiddleware };
