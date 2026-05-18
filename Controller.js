require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const { User, Restaurant, Address, Dish, Order, OrderItem, sequelize } = models;

// =================== USUÁRIO ===================
app.post('/create', async (req, res) => {
  try {
    await User.create({
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
    });
    res.send(JSON.stringify('Cadastrado com sucesso!'));
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send(JSON.stringify('E-mail já cadastrado'));
    }
    res.status(500).send(JSON.stringify('Erro ao cadastrar'));
  }
});

app.post('/Login', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email, senha: req.body.senha },
    });
    if (!user) return res.send(JSON.stringify('error'));
    res.send(user);
  } catch (e) {
    res.status(500).send(JSON.stringify('error'));
  }
});

app.get('/users', async (req, res) => {
  try {
    const lista = await User.findAll({
      attributes: ['id', 'nome', 'email', 'created_at'],
    });
    res.json(lista);
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.put('/update', async (req, res) => {
  try {
    const [count] = await User.update(
      { senha: req.body.novaSenha },
      { where: { email: req.body.email } }
    );
    if (count) return res.send(JSON.stringify('Senha atualizada com sucesso!'));
    res.status(404).send(JSON.stringify('Usuário não encontrado'));
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const count = await User.destroy({ where: { email: req.body.email } });
    if (count) return res.send(JSON.stringify('Usuario deletado com sucesso!'));
    res.status(404).send(JSON.stringify('Usuário não encontrado'));
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});

// =================== RESTAURANTES ===================
app.get('/restaurants', async (req, res) => {
  try {
    const lista = await Restaurant.findAll({
      attributes: { exclude: ['senha'] },
      order: [['nome', 'ASC']],
    });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.post('/restaurants', async (req, res) => {
  try {
    const novo = await Restaurant.create({
      nome: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone,
      cnpj: req.body.cnpj,
      senha: req.body.senha,
    });
    res.status(201).json(novo);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail ou CNPJ já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar restaurante' });
  }
});

app.post('/restaurants/login', async (req, res) => {
  try {
    const r = await Restaurant.findOne({
      where: { email: req.body.email, senha: req.body.senha },
    });
    if (!r) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const { senha, ...semSenha } = r.toJSON();
    res.json(semSenha);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.get('/restaurants/:id', async (req, res) => {
  try {
    const r = await Restaurant.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
    });
    if (!r) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(r);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== ENDEREÇOS ===================
app.get('/users/:userId/addresses', async (req, res) => {
  try {
    const lista = await Address.findAll({ where: { user_id: req.params.userId } });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.post('/users/:userId/addresses', async (req, res) => {
  try {
    const novo = await Address.create({
      user_id: req.params.userId,
      apelido: req.body.apelido,
      rua: req.body.rua,
      numero: req.body.numero,
      complemento: req.body.complemento,
      cidade: req.body.cidade,
      estado: req.body.estado,
      cep: req.body.cep,
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao criar endereço' });
  }
});

app.put('/addresses/:id', async (req, res) => {
  try {
    const a = await Address.findByPk(req.params.id);
    if (!a) return res.status(404).json({ erro: 'Não encontrado' });
    await a.update(req.body);
    res.json(a);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.delete('/addresses/:id', async (req, res) => {
  try {
    const count = await Address.destroy({ where: { id: req.params.id } });
    res.json({ excluido: !!count });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== CARDÁPIO / DISHES ===================
app.get('/dishes', async (req, res) => {
  try {
    const where = {};
    if (req.query.restaurant_id) where.restaurant_id = req.query.restaurant_id;
    if (req.query.disponivel != null) where.disponivel = req.query.disponivel === 'true';
    const lista = await Dish.findAll({ where, order: [['nome', 'ASC']] });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.post('/dishes', async (req, res) => {
  try {
    const novo = await Dish.create(req.body);
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao criar prato' });
  }
});

app.put('/dishes/:id', async (req, res) => {
  try {
    const d = await Dish.findByPk(req.params.id);
    if (!d) return res.status(404).json({ erro: 'Não encontrado' });
    await d.update(req.body);
    res.json(d);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.delete('/dishes/:id', async (req, res) => {
  try {
    const count = await Dish.destroy({ where: { id: req.params.id } });
    res.json({ excluido: !!count });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== PEDIDOS / ORDERS ===================
app.get('/orders', async (req, res) => {
  try {
    const where = {};
    if (req.query.user_id) where.user_id = req.query.user_id;
    if (req.query.status) where.status = req.query.status;

    const dishWhere = {};
    if (req.query.restaurant_id) dishWhere.restaurant_id = req.query.restaurant_id;

    const lista = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          required: !!req.query.restaurant_id,
          include: [{
            model: Dish,
            as: 'dish',
            required: !!req.query.restaurant_id,
            where: req.query.restaurant_id ? dishWhere : undefined,
          }],
        },
        { model: Address, as: 'address' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const pedido = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Dish, as: 'dish' }] },
        { model: Address, as: 'address' },
        { model: User, as: 'user', attributes: ['id', 'nome', 'email'] },
      ],
    });
    if (!pedido) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(pedido);
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// Cria pedido + itens em uma transação. Espera:
// { user_id, address_id, total, items: [{ dish_id, quantidade_g, preco_total, ... }] }
app.post('/orders', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, address_id, total, items } = req.body;
    const pedido = await Order.create(
      { user_id, address_id, total, status: 'Em preparo' },
      { transaction: t }
    );
    const linhas = (items || []).map((it) => ({
      order_id: pedido.id,
      dish_id: it.dish_id,
      nome_snapshot: it.nome_snapshot,
      quantidade_g: it.quantidade_g,
      preco_por_kg_snapshot: it.preco_por_kg_snapshot,
      preco_total: it.preco_total,
      observacao: it.observacao,
    }));
    if (linhas.length) await OrderItem.bulkCreate(linhas, { transaction: t });
    await t.commit();
    const completo = await Order.findByPk(pedido.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    res.status(201).json(completo);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

app.put('/orders/:id/status', async (req, res) => {
  try {
    if (!Order.STATUS.includes(req.body.status)) {
      return res.status(400).json({ erro: 'Status inválido' });
    }
    const [count] = await Order.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    res.json({ atualizado: !!count });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    const count = await Order.destroy({ where: { id: req.params.id } });
    res.json({ excluido: !!count });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== HEALTH ===================
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Rango rodando em http://localhost:${port}`);
});
