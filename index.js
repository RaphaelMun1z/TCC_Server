const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
    method: ["GET", "POST"],
    credentials: true,
}))

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        key: "userId",
        secret: "subscribe",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
        },
    })
);

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    port: '3306',
    password: "password",
    database: "db_hoh",
});

app.post("/register", (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const contact = req.body.contact;
    const userType = req.body.userType;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }

        db.query(
            "INSERT INTO tb_users (firstname, password, lastname, contact, email, usertype ) VALUES (?,?,?,?,?,?)",
            [
                firstName,
                hash,
                lastName,
                contact,
                email,
                userType
            ],
            (err, result) => {
                if (err) return console.log(err);

                console.log("Cadastrado com sucesso!");
            }
        );
    });
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT * FROM tb_users WHERE email = ?;",
        email,
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        console.log(result)
                        res.send(result);
                    } else {
                        res.send({ message: "Combinação email/senha incorreta!" });
                    }
                });
            } else {
                res.send({ message: "Usuário inexistente!" });
            }
        }
    );
});

app.listen(3001, () => {
    console.log("Servidor rodando!");
});