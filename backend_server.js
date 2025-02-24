const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/inventory', inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});