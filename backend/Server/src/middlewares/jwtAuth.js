import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required. Missing or malformed Bearer token.', 
      status: 401 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    // Attach the decoded token payload (containing tenantId, etc.) to the request object
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token', 
      status: 401 
    });
  }
};
