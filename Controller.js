require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
    const { email, senhaAtual, novaSenha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send(JSON.stringify('Usuário não encontrado'));
    const confere = senhaAtual && (await bcrypt.compare(senhaAtual, user.senha));
    if (!confere) return res.status(401).send(JSON.stringify('Senha atual incorreta'));
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await user.update({ senha: senhaHash });
    res.send(JSON.stringify('Senha atualizada com sucesso!'));
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

// =================== RECUPERAÇÃO DE SENHA ===================
// Fluxo seguro: o usuário pede o link por e-mail; o token aleatório fica
// guardado com hash e expira em 1 hora. O e-mail leva a uma página ponte
// (GET /reset/:token) que abre o app via deep link rangoapp://.
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://rango-api.onrender.com';
const APP_SCHEME = 'rangoapp';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function enviarEmailReset(para, nome, link) {
  // Sem SMTP configurado, o link sai no log do servidor (útil em dev).
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[reset-senha] SMTP não configurado. Link para ${para}: ${link}`);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Rango App" <${process.env.SMTP_USER}>`,
      to: para,
      subject: 'Redefinição de senha — Rango App',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:440px;margin:0 auto;">
          <div style="background:#EA1D2C;border-radius:12px 12px 0 0;padding:18px;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:bold;">Rango App</span>
          </div>
          <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:24px;">
            <p>Olá, <strong>${nome || ''}</strong>!</p>
            <p>Recebemos um pedido para redefinir a sua senha. Toque no botão abaixo
            <strong>pelo celular com o Rango App instalado</strong>:</p>
            <p style="text-align:center;margin:26px 0;">
              <a href="${link}" style="background:#EA1D2C;color:#fff;text-decoration:none;
                 padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block;">
                Redefinir minha senha
              </a>
            </p>
            <p style="color:#888;font-size:12px;">O link expira em 1 hora. Se você não pediu
            a redefinição, ignore este e-mail — sua senha continua a mesma.</p>
          </div>
        </div>`,
    });
  } catch (e) {
    console.log(`[reset-senha] Falha ao enviar e-mail (${e.message}). Link: ${link}`);
  }
}

function paginaReset(deepLink) {
  const corpo = deepLink
    ? `<p style="color:#444;">Toque no botão para abrir o aplicativo e criar sua nova senha.</p>
       <a href="${deepLink}" style="display:inline-block;background:#EA1D2C;color:#fff;
          padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Abrir no Rango App</a>
       <p style="color:#9A9A9A;font-size:12px;margin-top:18px;">Abra este link no celular onde o app está instalado.</p>
       <script>setTimeout(function(){ window.location = ${JSON.stringify(deepLink)}; }, 400);</script>`
    : `<p style="color:#444;">Este link de redefinição é <strong>inválido ou expirou</strong>.</p>
       <p style="color:#9A9A9A;font-size:13px;">Volte ao app e solicite um novo em “Esqueceu a senha?”.</p>`;
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Rango App — Redefinir senha</title></head>
    <body style="font-family:Arial,sans-serif;background:#F7F7F8;text-align:center;padding:48px 16px;">
      <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:14px;padding:30px;
                  box-shadow:0 2px 10px rgba(0,0,0,0.06);">
        <h1 style="color:#EA1D2C;margin:0 0 14px;">Rango App</h1>
        ${corpo}
      </div>
    </body></html>`;
}

// Resposta sempre genérica para não revelar quais e-mails existem na base.
app.post('/esqueci-senha', async (req, res) => {
  const mensagem = 'Se este e-mail estiver cadastrado, você receberá um link de redefinição.';
  try {
    const email = (req.body.email || '').trim();
    const user = email ? await User.findOne({ where: { email } }) : null;
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await user.update({
        reset_token: hashToken(token),
        reset_token_expira: new Date(Date.now() + 60 * 60 * 1000),
      });
      await enviarEmailReset(user.email, user.nome, `${PUBLIC_URL}/reset/${token}`);
    }
    res.json({ ok: true, mensagem });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// Página ponte: e-mails não abrem rangoapp:// direto, então o link do e-mail
// é HTTPS e esta página redireciona para o deep link do app.
app.get('/reset/:token', async (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  try {
    const user = await User.findOne({ where: { reset_token: hashToken(req.params.token) } });
    const valido = user && user.reset_token_expira && new Date(user.reset_token_expira) > new Date();
    if (!valido) return res.status(400).send(paginaReset(null));
    res.send(paginaReset(`${APP_SCHEME}://redefinir-senha?token=${req.params.token}`));
  } catch (e) {
    res.status(400).send(paginaReset(null));
  }
});

app.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha || String(novaSenha).length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    const user = await User.findOne({ where: { reset_token: hashToken(token) } });
    const valido = user && user.reset_token_expira && new Date(user.reset_token_expira) > new Date();
    if (!valido) {
      return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });
    }
    await user.update({
      senha: await bcrypt.hash(String(novaSenha), 10),
      reset_token: null,
      reset_token_expira: null,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
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
