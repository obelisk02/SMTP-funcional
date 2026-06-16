const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
