require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const queryRoutes = require('./routes/queryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const faqRoutes = require("./routes/faqRoutes");
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', queryRoutes);
app.use('/api', chatRoutes);
app.use('/api', uploadRoutes);
app.use('/api', categoryRoutes);
app.use("/api", faqRoutes);

app.use(errorHandler);

module.exports = app;

