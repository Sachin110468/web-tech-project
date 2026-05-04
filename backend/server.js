const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());



app.get("/check", (req, res) => {
    res.send("OK WORKING");
});

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "expense_tracker"
});

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
    } else {
        console.log("MySQL Connected");
    }
});

app.get("/", (req, res) => {
    res.send("Server running");
});



app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    console.log("REGISTER API:", username, password);

    if (!username || !password) {
        return res.json({ success: false, message: "Enter all fields" });
    }

    db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {

        if (err) {
            console.log("SELECT ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        if (result.length > 0) {
            return res.json({ success: false, message: "User already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [username, hashedPassword],
                (err) => {
                    if (err) {
                        console.log("INSERT ERROR:", err);
                        return res.json({ success: false, message: "Insert error" });
                    }

                    res.json({ success: true, message: "User Registered" });
                }
            );

        } catch (e) {
            console.log("HASH ERROR:", e);
            res.json({ success: false, message: "Hash error" });
        }
    });
});



app.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("LOGIN API:", username, password);

    if (!username || !password) {
        return res.json({ success: false });
    }

    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, result) => {

            if (err) {
                console.log("LOGIN ERROR:", err);
                return res.json({ success: false });
            }

            if (result.length === 0) {
                return res.json({ success: false });
            }

            try {
                const match = await bcrypt.compare(password, result[0].password);

                if (match) {
                    res.json({ success: true, userId: result[0].id });
                } else {
                    res.json({ success: false });
                }

            } catch (e) {
                console.log("COMPARE ERROR:", e);
                res.json({ success: false });
            }
        }
    );
});


// बाकी code same
app.post("/add", (req, res) => {
    const { userId, amount, type, category, date, notes } = req.body;

    if (!userId || !amount || !type || !category) {
        return res.status(400).json({ message: "Missing fields" });
    }

    db.query(
        "INSERT INTO transactions (userId, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, amount, type, category, date, notes],
        (err) => {
            if (err) return res.status(500).send("Error");
            res.json({ message: "Transaction Added" });
        }
    );
});

app.get("/data/:userId", (req, res) => {
    db.query(
        "SELECT * FROM transactions WHERE userId=? ORDER BY id DESC",
        [req.params.userId],
        (err, result) => {
            if (err) return res.status(500).send("Error");
            res.json(result);
        }
    );
});

app.delete("/delete/:id", (req, res) => {
    db.query(
        "DELETE FROM transactions WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send("Error");
            res.json({ message: "Deleted" });
        }
    );
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
});
