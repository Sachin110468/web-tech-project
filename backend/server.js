const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());



const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "expense_tracker"
});

db.connect(err => {
    if (err) {
        console.log(" DB Error:", err);
    } else {
        console.log(" MySQL Connected");
    }
});



app.get("/", (req, res) => {
    res.send("Server running");
});



app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: "Enter all fields" });
    }

    try {
      
        db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
            if (err) return res.send(err);

            if (result.length > 0) {
                return res.json({ success: false, message: "User already exists" });
            }

           
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [username, hashedPassword],
                (err, result) => {
                    if (err) return res.send(err);

                    res.json({ success: true, message: "User Registered " });
                }
            );
        });

    } catch (error) {
        res.status(500).send("Error");
    }
});



app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false });
    }

    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, result) => {
            if (err) return res.send(err);

            if (result.length === 0) {
                return res.json({ success: false });
            }

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.json({ success: true, userId: user.id });
            } else {
                res.json({ success: false });
            }
        }
    );
});



app.post("/add", (req, res) => {
    const { userId, amount, type, category, date, notes } = req.body;

    if (!userId || !amount || !type || !category) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const sql = `
        INSERT INTO transactions (userId, amount, type, category, date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, amount, type, category, date, notes], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.json({ message: "Transaction Added" });
    });
});



app.get("/data/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = "SELECT * FROM transactions WHERE userId=? ORDER BY id DESC";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.json(result);
    });
});


app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM transactions WHERE id=?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.json({ message: "Deleted" });
    });
});



app.listen(5000, () => {
    console.log("🚀 Server started on port 5000");
});
