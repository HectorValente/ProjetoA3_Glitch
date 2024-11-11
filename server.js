/*
------------------
@description 
	Escrever uma descrição.
------------------
@author 
  Héctor Valente, Pedro Soares, Leonardo e Lorhan
------------------
@date 
  22/10/2024
------------------
@routes
	GET/
    /api/pokemon
    /api/usuario
    /api/pokemon/:id
    /api/usuario/:email
	POST/
    /api/usuario
    /api/login
	DELETE/
    /api/usuario/:email
	PATCH/
    /api/usuario/:email
------------------
@history
  22/10/2024 - Héctor Valente - Inclusão das rotas ([GET] /api/pokemon, api/pokemon/:id, /api/usuario e /api/usuario/:email);
  03/11/2024 - Héctor Valente - Inclusão das rotas([POST /api/usuario, /api/login], [DELETE /api/usuario/:email], [PATCH api/jogador/:email]);
  03/11/2024 - Héctor Valente - Implementação do verifyToken;
------------------
*/

/*---------------------------------------------------------------------------------------------------------------*/

//Criar o APP Express
const express = require("express");
const app = express();
const fs = require("fs");

//Inicialização do banco de dados SQLite
const dbFile = './.data/db_poketrunfo.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


//db.run("DROP TABLE Pokemon")
//db.run("DROP TABLE Usuario")
//db.run("DROP TABLE Partida")
//db.run("DROP TABLE Rodada")
//db.run("CREATE TABLE Pokemon (id INT NOT NULL PRIMARY KEY,nome VARCHAR(100) NOT NULL,hp INT NOT NULL,atk INT NOT NULL,spAtk INT NOT NULL,def INT NOT NULL,spDef INT NOT NULL,speed INT NOT NULL)");
//db.run("INSERT INTO Pokemon (id, nome, hp, atk, spAtk, def, spDef, speed) VALUES (1, 'Bulbasaur', 45, 49, 65, 49, 65, 45),(2, 'Ivysaur', 60, 62, 80, 63, 80, 60),(3, 'Venusaur', 80, 82, 100, 83, 100, 80),(4, 'Charmander', 39, 52, 60, 43, 50, 65),(5, 'Charmeleon', 58, 64, 80, 58, 65, 80),(6, 'Charizard', 78, 84, 109, 78, 85, 100),(7, 'Squirtle', 44, 48, 50, 65, 64, 43),(8, 'Wartortle', 59, 63, 65, 80, 80, 58),(9, 'Blastoise', 79, 83, 85, 100, 105, 78)");
//db.run("CREATE TABLE Usuario (email VARCHAR(100) NOT NULL PRIMARY KEY,nome VARCHAR(100) NOT NULL,senha VARCHAR(10) NOT NULL)");

//Chamando jwt, bcryptjs e body-parser
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');

//Vamos tratar quando o visitante acessar o "/" (página principal)
app.get("/", function(request, response){
  response.sendFile(__dirname + "/index.html");
});

app.use(express.json());

/*---------------------------------------------------------------------------------------------------------------*/

/*INÍCIO: LOGIN E TOKEN*/

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign({ email: user.email, senha: user.senha }, 'seuSegredoJWT', { expiresIn: '1h' });
};

// Rota para login de Usuário
app.post('/api/login', (request, response) => {
  const { email, senha } = request.body;

  // Busca o usuário no banco de dados
  db.get('SELECT email, senha FROM Usuario WHERE email = ?', [email], (err, user) => {
    if (err) {
      return response.status(500).json({ error: 'Erro no banco de dados.' });
    }
    if (!user) {
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    console.log(senha+' '+user.senha);
    //aqui vai entrar criptografia depois..
    if (senha == user.senha) {
      const token = generateToken(user);
      return response.json({message: "Login bem-sucedido!", token});
    } else {
      return response.status(401).json({error: "Senha inválida."});
    }
  });
});
  
// Verificar token!
const verifyToken = (request, response, next) => {
  const token = request.headers['x-access-token'];
  if (!token) { //undefined
    return response.status(403).json({error: 'Nenhum token foi fornecido.'});
  }
  
  jwt.verify(token, 'seuSegredoJWT', (error, decoded) => {
    if (error) {
      return response.status(500).json({error: 'Falha ao autenticar o token.'});
    }
    
    request.email = decoded.email;
    request.senha = decoded.senha;
    next();
  });
};

/*FIM: LOGIN E TOKEN*/

/*---------------------------------------------------------------------------------------------------------------*/

/*INÍCIO: ENDPOINTS*/

//Rota GET para retornar todos os Pokemon
app.get("/api/pokemon", function(request, response){
  db.all("SELECT * FROM Pokemon", (error, linhas) =>{
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});

// Rota GET para retornar um único Pokemon, passando o id do mesmo na URL
app.get("/api/pokemon/:id", function(request, response) {
  const id = parseInt(request.params.id);
  const sql = "SELECT * FROM Pokemon WHERE id = ?";
  db.get(sql, [id], function(error, linha) {
    if (error) {
      return response.status(500).send(error);      
    } else {
      console.log(linha);
      if (!linha) {
        return response.status(404).send("Pokemon não encontrado"); 
      } else {
        response.setHeader('content-type', 'application/json');
        return response.send(JSON.stringify(linha));
      }
    }
  });
});

//Rota GET para retornar todos os Usuários
app.get("/api/usuario", function(request, response){
  db.all("SELECT * FROM Usuario", (error, linhas) =>{
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});

// Rota GET para retornar um único Usuário, passando o email do mesmo na URL
app.get("/api/usuario/:email", function(request, response) {
  const email = parseInt(request.params.email);
  const sql = "SELECT * FROM Usuario WHERE email = ?";
  db.get(sql, [email], function(error, linha) {
    if (error) {
      return response.status(500).send(error);      
    } else {
      console.log(linha);
      if (!linha) {
        return response.status(404).send("Usuário não encontrado"); 
      } else {
        response.setHeader('content-type', 'application/json');
        return response.send(JSON.stringify(linha));
      }
    }
  });
});

//Rota POST para criar um Usuário
app.post("/api/usuario", function(request, response){
  db.run("INSERT INTO Usuario (email, nome, senha) VALUES(?,?,?)", request.body.email, request.body.nome, request.body.senha, function(error){
    if (error){
      return response.status(500).send(error);
    } else{
      return response.status(201).json({email: request.body.email, nomel: request.body.nome, senha: request.body.senha, valid: "true"});
    }
  });
});

//Rota DEL para deletar um Usuário
app.delete("/api/usuario/:email", verifyToken, function(request, response) {
  const email = request.params.email;
  const sql = "DELETE FROM Usuario WHERE email = ?";
  db.run(sql, [email], function(error){
    if (error) {
      return response.status(500).send("Erro no servidor");
    }else{
      if (this.changes === 0){
        return response.status(404).send("Usuário não encontrado");
      }else{
        return response.status(204).send();
      }
    }
  });
});

//Rota PATCH para alterar senha do Usuário
app.patch("/api/usuario/:email", verifyToken, function(request, response) {
  const email = request.params.email;
  
  // Passando TUDO, nome, preco, estoque..
  let set = "";
  let valores = [];
  
  // Se vai ter nome
  console.log(request.body.senha);
  if (request.body.senha != undefined){
    set = "senha=?";
    valores.push(request.body.senha);    
  }
  
  const sql = "UPDATE Usuario SET "+set+" WHERE email=?";
  valores.push(email);
  console.log(sql);
  
  db.run(sql, valores, function(error) {
    if (error) {
      return response.status(500).send("Erro interno do servidor.");
    } else {
      if (this.changes === 0) {
        return response.status(404).send("Usuário não encontrado.");
      } else {
        return response.status(200).send();
      }
    }
  });
});

/*FIM: ENDPOINTS*/

/*---------------------------------------------------------------------------------------------------------------*/

//Listener
const listener = app.listen(process.env.PORT, function(){
  console.log("Teste" + listener.address().port);
});