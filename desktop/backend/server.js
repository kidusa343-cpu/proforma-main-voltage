const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const proformaRoutes = require('./routes/authRoutes');
const authRoute = require('./routes/authRoutes')
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api', proformaRoutes);
app.use('/api/authRoute' , authRoute)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
