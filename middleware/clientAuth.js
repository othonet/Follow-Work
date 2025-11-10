const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const clientAuthMiddleware = async (req, res, next) => {
  try {
    // Verificar token de cliente primeiro
    let token = req.cookies.clientToken;
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (user && user.role === 'cliente') {
          req.user = user;
          return next();
        }
      } catch (error) {
        // Token inválido, continuar para verificar token admin
      }
    }

    // Se não for cliente, verificar se é admin (pode acessar via token admin)
    token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (user && user.role === 'admin') {
          req.user = user;
          return next();
        }
      } catch (error) {
        // Token inválido
      }
    }

    // Se não encontrou usuário válido, redirecionar para login
    return res.redirect('/login');
  } catch (error) {
    res.redirect('/login');
  }
};

module.exports = clientAuthMiddleware;

