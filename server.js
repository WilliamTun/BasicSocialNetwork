const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API Running'));

const PORT  = process.env.PORT || 5000 // looks for an environment variable called port - for Heroku ... OR 5000 locally

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

