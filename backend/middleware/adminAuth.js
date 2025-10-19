import jwt from 'jsonwebtoken';

const adminAuthMiddleware = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For now, we'll allow any authenticated user to access admin routes
    // In production, you should add role-based access control
    req.admin = { _id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Admin token expired' : 'Invalid admin token';
    res.status(403).json({ success: false, message });
  }
};

export default adminAuthMiddleware;
