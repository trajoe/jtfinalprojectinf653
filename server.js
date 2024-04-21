require('dotenv').config();
const express = require('express')
const app = express()
const { logger } = require('./middleware/logEvents');
const mongoose = require('mongoose');
const path = require('path');
const logEvents = require('./middleware/logEvents');
const cors = require('cors');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const statesData = require('./models/statesData.json');
const { getState } = require('./controllers/stateController');
const stateRoutes = require('./routes/stateRoutes');


connectDB();


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
    )





app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

//middlware
app.use(logger);

app.use(cors());

app.use(express.urlencoded({extended:false}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '/public')));







//routes
app.use('/states', stateRoutes);




//app.get('/states/:state', getState);




app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});



app.all('*', (req, res) => {
    res.status(404).send('404 Not Found');
});




app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});