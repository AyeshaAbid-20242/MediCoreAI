const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./Data/MongoDb');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));