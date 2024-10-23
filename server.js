/*
------------------
@description 
	Escrever uma descrição.
------------------
@author 
  Héctor Valente
------------------
@date 
  2024-10-22
------------------
@routes
	GET/
	POST/
	DELETE/
	PATCH/
------------------
@history
  Histórico de alteração
------------------
*/

//Criar o APP Express
const express = require("express");
const app = express();
const fs = require("fs");

//Inicialização do banco de dados SQLite
const dbFile = './.data/db_poketrunfo.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

//Chamando jwt, bcryptjs e body-parser
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');

//Vamos tratar quando o visitante acessar o "/" (página principal)
app.get("/", function(request, response){
  response.sendFile(__dirname + "/index.html");
});

app.use(express.json());

/*INÍCIO: LOGIN E TOKEN*/
/*FIM: LOGIN E TOKEN*/

/*INÍCIO: ENDPOINTS*/

//Rota GET para retornar todos os produtos
app.get("/api/pokemon", function(request, response){
  db.all("SELECT * FROM Pokemon", (error, linhas) =>{
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});

/*FIM: ENDPOINTS*/

//Listener
const listener = app.listen(process.env.PORT, function(){
  console.log("Teste" + listener.address().port);
});