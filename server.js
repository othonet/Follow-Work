require('dotenv').config();
const express = require('express');
const expressHandlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const path = require('path');
const handlebarsHelpers = require('./helpers/handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars configuration
app.engine('hbs', expressHandlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: handlebarsHelpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes - Admin routes must come first to avoid conflicts
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

