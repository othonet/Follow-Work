const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/admin/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.redirect('/admin/login');
    }

    // Verificar se o campo role existe e é admin
    if (!user.role || user.role !== 'admin') {
      return res.redirect('/admin/login');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação admin:', error);
    return res.redirect('/admin/login');
  }
};

module.exports = authMiddleware;

