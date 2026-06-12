require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const { User, Restaurant, Address, Dish, Order, OrderItem, sequelize } = models;

// =================== USUÁRIO ===================
app.post('/create', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUser = await User.create({ nome, email, senha: senhaHash });
    const { senha: _, ...semSenha } = novoUser.toJSON();
    res.status(201).json(semSenha);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send(JSON.stringify('E-mail já cadastrado'));
    }
    res.status(500).send(JSON.stringify('Erro ao cadastrar'));
  }
});

app.post('/Login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).send(JSON.stringify('error'));
    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) return res.status(401).send(JSON.stringify('error'));
    const { senha: _, ...semSenha } = user.toJSON();
    res.json(semSenha);
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
    const senhaHash = await bcrypt.hash(req.body.novaSenha, 10);
    const [count] = await User.update(
      { senha: senhaHash },
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
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).send(JSON.stringify('Usuário não encontrado'));
    const pedidos = await Order.count({ where: { user_id: user.id } });
    if (pedidos > 0) {
      return res.status(400).send(
        JSON.stringify('Conta possui pedidos vinculados e não pode ser excluída.')
      );
    }
    await Address.destroy({ where: { user_id: user.id } });
    await user.destroy();
    res.send(JSON.stringify('Usuario deletado com sucesso!'));
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

app.post('/InscrevaseRestaurante', async (req, res) => {
  try {
    const { nome, email, telefone, cnpj, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const novo = await Restaurant.create({ nome, email, telefone, cnpj, senha: senhaHash });
    const { senha: _, ...semSenha } = novo.toJSON();
    res.status(201).json(semSenha);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail ou CNPJ já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar restaurante' });
  }
});

app.post('/restaurants', async (req, res) => {
  try {
    const { nome, email, telefone, cnpj, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const novo = await Restaurant.create({ nome, email, telefone, cnpj, senha: senhaHash });
    const { senha: _, ...semSenha } = novo.toJSON();
    res.status(201).json(semSenha);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail ou CNPJ já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar restaurante' });
  }
});

app.post('/restaurants/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const r = await Restaurant.findOne({ where: { email } });
    if (!r) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const senhaOk = await bcrypt.compare(senha, r.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const { senha: _, ...semSenha } = r.toJSON();
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

app.put('/restaurants/:id', async (req, res) => {
  try {
    const r = await Restaurant.findByPk(req.params.id);
    if (!r) return res.status(404).json({ erro: 'Restaurante não encontrado.' });
    const { senha, ...dados } = req.body;
    if (senha) {
      dados.senha = await bcrypt.hash(senha, 10);
    }
    await r.update(dados);
    const { senha: _, ...semSenha } = r.toJSON();
    res.json(semSenha);
  } catch (e) {
    res.status(500).json({ erro: e.message });
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
// { user_id, address_id, items: [{ dish_id, quantidade_g, observacao }] }
app.post('/orders', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, address_id, items } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ erro: 'O pedido deve ter pelo menos um item.' });
    }

    const linhas = [];
    let totalCalculado = 0;
    for (const it of items) {
      const prato = await Dish.findByPk(it.dish_id);
      if (!prato) {
        await t.rollback();
        return res.status(400).json({ erro: `Prato ${it.dish_id} não encontrado.` });
      }
      if (!prato.disponivel) {
        await t.rollback();
        return res.status(400).json({ erro: `Prato "${prato.nome}" não está disponível.` });
      }
      if (it.quantidade_g < prato.peso_min_g) {
        await t.rollback();
        return res.status(400).json({ erro: `Quantidade mínima para "${prato.nome}" é ${prato.peso_min_g}g.` });
      }
      if (it.quantidade_g > prato.peso_max_g) {
        await t.rollback();
        return res.status(400).json({ erro: `Quantidade máxima para "${prato.nome}" é ${prato.peso_max_g}g.` });
      }
      const precoTotal = parseFloat((prato.preco_por_kg * (it.quantidade_g / 1000)).toFixed(2));
      totalCalculado += precoTotal;
      linhas.push({
        dish_id: prato.id,
        nome_snapshot: prato.nome,
        quantidade_g: it.quantidade_g,
        preco_por_kg_snapshot: prato.preco_por_kg,
        preco_total: precoTotal,
        observacao: it.observacao || null,
      });
    }
    totalCalculado = parseFloat(totalCalculado.toFixed(2));

    const pedido = await Order.create(
      { user_id, address_id, total: totalCalculado, status: 'Em preparo' },
      { transaction: t }
    );
    const linhasComOrderId = linhas.map((l) => ({ ...l, order_id: pedido.id }));
    await OrderItem.bulkCreate(linhasComOrderId, { transaction: t });
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
    const { status } = req.body;
    if (!Order.STATUS.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido' });
    }

    const TRANSICOES_VALIDAS = {
      'Em preparo': ['Saiu para entrega', 'Cancelado'],
      'Saiu para entrega': ['Entregue', 'Cancelado'],
      'Entregue': [],
      'Cancelado': [],
    };
    const pedidoAtual = await Order.findByPk(req.params.id);
    if (!pedidoAtual) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    const permitidos = TRANSICOES_VALIDAS[pedidoAtual.status] || [];
    if (!permitidos.includes(status)) {
      return res.status(400).json({ erro: `Transição de "${pedidoAtual.status}" para "${status}" não permitida.` });
    }

    await pedidoAtual.update({ status });
    res.json({ atualizado: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    const pedido = await Order.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    if (['Em preparo', 'Saiu para entrega'].includes(pedido.status)) {
      return res.status(400).json({ erro: 'Não é possível excluir um pedido em andamento.' });
    }
    await pedido.destroy();
    res.json({ excluido: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== AVALIAÇÕES ===================
app.post('/ratings', async (req, res) => {
  try {
    const { order_id, restaurant_id, user_id, nota_entrega, nota_restaurante, comentario } = req.body;
    if (!restaurant_id) return res.status(400).json({ erro: 'restaurant_id obrigatório.' });
    const r = await models.Rating.create({
      order_id: order_id || null,
      restaurant_id,
      user_id: user_id || null,
      nota_entrega: Number(nota_entrega) || 0,
      nota_restaurante: Number(nota_restaurante) || 0,
      comentario: comentario || null,
    });
    res.status(201).json(r);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao salvar avaliação.' });
  }
});

app.get('/ratings', async (req, res) => {
  try {
    const where = {};
    if (req.query.restaurant_id) where.restaurant_id = req.query.restaurant_id;
    if (req.query.user_id) where.user_id = req.query.user_id;
    const lista = await models.Rating.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
  }
});

app.get('/ratings/avg/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const lista = await models.Rating.findAll({ where: { restaurant_id } });
    if (lista.length === 0) return res.json({ media: 0, total: 0 });
    const soma = lista.reduce((acc, r) => acc + ((r.nota_entrega + r.nota_restaurante) / 2), 0);
    res.json({ media: soma / lista.length, total: lista.length });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== HEALTH ===================
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Servidor Rango rodando em http://localhost:${port}`);
});
