const mysql = require("mysql2");

const con = mysql.createConnection({
    host: "sakura.proxy.rlwy.net",
    port: 19056,
    user: "root",
    password: "TxoDTTZPwIhMBOhFfbZDyKhCADmnbWiG",
    database: "railway",
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 120000
});

con.connect((err) => {
    if (err) {
        console.log("MYSQL ERROR:");
        console.log(err.message);
        return;
    }

    console.log("MYSQL CONNECTED SUCCESSFULLY");
});