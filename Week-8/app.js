const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS and other files
app.use(express.static(__dirname));


// ===============================
// HELPER FUNCTION
// ===============================

function readJSON(fileName, defaultValue = []) {
    const filePath = path.join(__dirname, fileName);

    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(
                filePath,
                JSON.stringify(defaultValue, null, 2)
            );

            return defaultValue;
        }

        const data = fs.readFileSync(filePath, "utf8");

        return data ? JSON.parse(data) : defaultValue;

    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return defaultValue;
    }
}


function writeJSON(fileName, data) {
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );
}


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ===============================
// REGISTER USER
// ===============================

app.post("/register", (req, res) => {

    const {
        name,
        email,
        mobile,
        username,
        password,
        address
    } = req.body;

    // Check required fields
    if (
        !name ||
        !email ||
        !mobile ||
        !username ||
        !password ||
        !address
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }


    // Read users
    const users = readJSON("users.json", []);


    // Check duplicate username
    const existingUsername = users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUsername) {
        return res.status(400).json({
            success: false,
            message: "Username already exists."
        });
    }


    // Check duplicate email
    const existingEmail = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingEmail) {
        return res.status(400).json({
            success: false,
            message: "Email already registered."
        });
    }


    // Create new user
    const newUser = {
        id: users.length > 0
            ? users[users.length - 1].id + 1
            : 1,

        name: name,
        email: email,
        mobile: mobile,
        username: username,
        password: password,
        address: address
    };


    // Add user
    users.push(newUser);

    // Save users
    writeJSON("users.json", users);


    res.json({
        success: true,
        message: "Registration successful!"
    });
});


// ===============================
// LOGIN USER
// ===============================

app.post("/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter username/email and password."
        });
    }


    const users = readJSON("users.json", []);


    // Allow login using username OR email
    const user = users.find(user =>
        (
            user.username.toLowerCase() === username.toLowerCase()
            ||
            user.email.toLowerCase() === username.toLowerCase()
        )
        &&
        user.password === password
    );


    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid username/email or password."
        });
    }


    // Don't send password to frontend
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        username: user.username,
        address: user.address
    };


    res.json({
        success: true,
        message: "Login successful!",
        user: userData
    });
});


// ===============================
// GET FOOD MENU
// ===============================

app.get("/foods", (req, res) => {

    const foods = readJSON("foods.json", []);

    res.json(foods);
});


// ===============================
// PLACE ORDER
// ===============================

app.post("/orders", (req, res) => {

    const {
        username,
        items,
        total
    } = req.body;


    // Validate order
    if (
        !username ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Cart is empty."
        });
    }


    const orders = readJSON("orders.json", []);


    // Generate order ID
    const newOrderId =
        orders.length > 0
            ? orders[orders.length - 1].id + 1
            : 1001;


    // Create order
    const newOrder = {

        id: newOrderId,

        username: username,

        items: items,

        total: total,

        status: "Confirmed",

        date: new Date().toISOString()
    };


    // Add order
    orders.push(newOrder);


    // Save order
    writeJSON("orders.json", orders);


    res.json({
        success: true,
        message: "Order placed successfully!",
        order: newOrder
    });
});


// ===============================
// GET ORDERS FOR SPECIFIC USER
// ===============================

app.get("/orders/:username", (req, res) => {

    const username = req.params.username;


    const orders = readJSON("orders.json", []);


    // Find orders belonging to this user
    const userOrders = orders.filter(
        order =>
            order.username.toLowerCase() === username.toLowerCase()
    );


    res.json({
        success: true,
        orders: userOrders
    });
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `FoodEase is running at http://localhost:${PORT}`
    );

});