const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const User = models.User;
const Pedidos = models.Pedidos;
const Cardapio = models.Cardapio;

// =================== USUÁRIO (CRUD) ===================
app.post('/create', async (req, res) => {
  try {
    const reqs = await User.create({
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (reqs) {
      res.send(JSON.stringify('Cadastrado com sucesso!'));
    } else {
      res.send(JSON.stringify('Erro ao cadastrar'));
    }
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.post('/Login', async (req, res) => {
  try {
    const response = await User.findOne({
      where: { email: req.body.email, senha: req.body.senha },
    });
    if (response == null) {
      res.send(JSON.stringify('error'));
    } else {
      res.send(response);
    }
  } catch (e) {
    res.status(500).send(JSON.stringify('error'));
  }
});

app.get('/users', async (req, res) => {
  try {
    const lista = await User.findAll({
      attributes: ['id', 'nome', 'email', 'createdAt'],
    });
    res.json(lista);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.put('/update', async (req, res) => {
  try {
    const response = await User.update(
      { senha: req.body.novaSenha },
      { where: { email: req.body.email } }
    );
    if (response) {
      res.send(JSON.stringify('Senha atualizada com sucesso!'));
    } else {
      res.send(JSON.stringify('Erro ao atualizar'));
    }
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const response = await User.destroy({
      where: { email: req.body.email },
    });
    if (response) {
      res.send(JSON.stringify('Usuario deletado com sucesso!'));
    } else {
      res.send(JSON.stringify('Erro ao deletar'));
    }
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

// =================== PEDIDOS (CRUD) ===================
app.get('/pedidos', async (req, res) => {
  try {
    const lista = await Pedidos.findAll();
    res.json(lista);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.post('/pedidos', async (req, res) => {
  try {
    const novo = await Pedidos.create({
      Peso: req.body.Peso,
      Grama: req.body.Grama,
      idPedido: req.body.idPedido,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json(novo);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.put('/pedidos/:id', async (req, res) => {
  try {
    const result = await Pedidos.update(
      {
        Peso: req.body.Peso,
        Grama: req.body.Grama,
        idPedido: req.body.idPedido,
        updatedAt: new Date(),
      },
      { where: { id: req.params.id } }
    );
    res.json({ atualizado: !!result[0] });
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.delete('/pedidos/:id', async (req, res) => {
  try {
    const result = await Pedidos.destroy({ where: { id: req.params.id } });
    res.json({ excluido: !!result });
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

// =================== CARDÁPIO (CRUD) ===================
app.get('/cardapio', async (req, res) => {
  try {
    const lista = await Cardapio.findAll();
    res.json(lista);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.post('/cardapio', async (req, res) => {
  try {
    const novo = await Cardapio.create({
      Nome: req.body.Nome,
      idComida: req.body.idComida,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json(novo);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.put('/cardapio/:id', async (req, res) => {
  try {
    const result = await Cardapio.update(
      {
        Nome: req.body.Nome,
        idComida: req.body.idComida,
        updatedAt: new Date(),
      },
      { where: { id: req.params.id } }
    );
    res.json({ atualizado: !!result[0] });
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.delete('/cardapio/:id', async (req, res) => {
  try {
    const result = await Cardapio.destroy({ where: { id: req.params.id } });
    res.json({ excluido: !!result });
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.listen(port, () => {
  console.log(`Servidor Rango rodando em http://localhost:${port}`);
});
