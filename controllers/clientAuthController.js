const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginPage = (req, res) => {
  res.render('public/login');
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('public/login', { error: 'Nome de usuário e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.render('public/login', { error: 'Nome de usuário ou senha inválidos' });
    }

    if (user.role !== 'cliente') {
      return res.render('public/login', { error: 'Acesso negado. Esta área é apenas para clientes.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render('public/login', { error: 'Nome de usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('clientToken', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect('/');
  } catch (error) {
    console.error('Erro no login:', error);
    res.render('public/login', { error: 'Erro ao fazer login' });
  }
};

const logout = (req, res) => {
  res.clearCookie('clientToken');
  res.redirect('/login');
};

module.exports = {
  loginPage,
  login,
  logout
};

