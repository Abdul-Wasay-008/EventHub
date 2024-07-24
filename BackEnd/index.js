// Importing modules
import express from "express";
import dotenv from "dotenv";
import connection from "./db.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

// env configuration file
dotenv.config();

// port variable to access the port value from env config file
const port = process.env.PORT;

const app = express();

// Accessing the static files from the public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');
console.log(__filename); //path to index.js
console.log(__dirname); //path to directory containing index.js
console.log(publicPath); //full path to public directory
app.use(express.static(publicPath));

// middleware to parse form data using "body-parser"
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//session
app.use(session({
    secret: "EventHub",
    saveUninitialized: true,
    resave: false,
    cookie: {
        secure: false,
    }
}));

// Middleware for checking authenticated users
function isAuthenticated(req, res, next) {
    if (req.session && req.session.username) {
        return next();
    } else {
        res.redirect("/adminLogin.html");
    }
}

// A basic route
app.get("/", (req, res) => {
    res.redirect("/welcome.html");
});

// End point to handle form submission
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO admin (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, password], (err, results) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).send("An error occurred while saving the data");
        }
        res.status(201).send('User registered successfully!');
    });
});

// Endpoint for user login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM admin WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).send("An error occurred during login");
        }
        if (results.length > 0) {
            const username = results[0].username;  // Extract username from query result
            req.session.username = username;
            res.redirect("/adminDashboard.html");
        } else {
            res.status(401).send("Invalid email or password");
        }
    });
});

//Endpoint to create an event
app.post("/create-event", (req, res) => {
    const { EName, EDate, EPlace, ETime, EOrganizerName, TicketCosts } = req.body;
    const query = 'INSERT INTO events (EName, EDate, EPlace, ETIme, EOrganizerName, TicketCosts) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [EName, EDate, EPlace, ETime, EOrganizerName, TicketCosts];
    connection.query(query, values, (err, results) => {
        if (err) {
            console.err("Error creating an event. Please try again...", err);
            return res.status(500).send('An error occurred while saving the data');
        }
        res.status(201).send("Event created successfully");
    });
});

// Serve the dashboard and display the username
app.get("/adminDashboard.html", isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, "adminDashboard.html"));
});

// Endpoint to get the username from the session
app.get("/get-username", isAuthenticated, (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).send("Unauthorized");
    }
});


// Endpoint to fetch all events
app.get("/events", (req, res) => {
    const query = 'SELECT * FROM events';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).send("An error occurred while fetching the events");
        }
        res.json(results);
    });
});



// Setting up and starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
