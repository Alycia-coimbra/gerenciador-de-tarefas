const express = require("express");
const path = require("path");
const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Serve todos os arquivos estáticos da pasta atual (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});