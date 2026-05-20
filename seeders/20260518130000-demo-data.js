'use strict';

const bcrypt = require('bcryptjs');

const agora = () => new Date();

module.exports = {
  async up(queryInterface) {
    const now = agora();
    const senhaCliente = await bcrypt.hash('teste123', 10);
    const senhaRestaurante = await bcrypt.hash('restaurante123', 10);

    // ─────────────────────────────────────────────────────────────────────────
    // RESTAURANTES (Criciúma/SC e região)
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('restaurants', [
      {
        nome: 'Sabor da Serra',
        email: 'contato@sabordaserra.com.br',
        telefone: '(48) 3433-1010',
        cnpj: '12.345.678/0001-90',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Galpão Gaúcho Criciúma',
        email: 'contato@galpaogaucho.com.br',
        telefone: '(48) 3437-2233',
        cnpj: '98.765.432/0001-10',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Cantina do Léo',
        email: 'contato@cantinadoleo.com.br',
        telefone: '(48) 3045-7788',
        cnpj: '11.222.333/0001-44',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Cozinha da Vovó',
        email: 'contato@cozinhadavovo.com.br',
        telefone: '(48) 3432-9090',
        cnpj: '22.333.444/0001-55',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Tempero Catarinense',
        email: 'contato@temperocatarinense.com.br',
        telefone: '(48) 3438-4567',
        cnpj: '33.444.555/0001-66',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Marmita Fit Próspera',
        email: 'contato@marmitafit.com.br',
        telefone: '(48) 99876-1122',
        cnpj: '44.555.666/0001-77',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Cantinho do Peixe',
        email: 'contato@cantinhodopeixe.com.br',
        telefone: '(48) 3433-5544',
        cnpj: '55.666.777/0001-88',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
      {
        nome: 'Restaurante Mineiro do Centro',
        email: 'contato@mineirodocentro.com.br',
        telefone: '(48) 3045-3322',
        cnpj: '66.777.888/0001-99',
        senha: senhaRestaurante,
        created_at: now, updated_at: now,
      },
    ]);

    const [restaurants] = await queryInterface.sequelize.query(
      `SELECT id, nome FROM restaurants ORDER BY id ASC`
    );
    const idPor = (nome) => restaurants.find((r) => r.nome === nome).id;

    const rSerra   = idPor('Sabor da Serra');
    const rGaucho  = idPor('Galpão Gaúcho Criciúma');
    const rLeo     = idPor('Cantina do Léo');
    const rVovo    = idPor('Cozinha da Vovó');
    const rTempero = idPor('Tempero Catarinense');
    const rFit     = idPor('Marmita Fit Próspera');
    const rPeixe   = idPor('Cantinho do Peixe');
    const rMineiro = idPor('Restaurante Mineiro do Centro');

    // ─────────────────────────────────────────────────────────────────────────
    // PRATOS
    // ─────────────────────────────────────────────────────────────────────────
    const prato = (restaurant_id, nome, descricao, imagem_key, preco_por_kg,
                   peso_min_g = 100, peso_max_g = 1500, passo_g = 50, disponivel = true) => ({
      restaurant_id, nome, descricao, imagem_key,
      preco_por_kg, peso_min_g, peso_max_g, passo_g, disponivel,
      created_at: now, updated_at: now,
    });

    await queryInterface.bulkInsert('dishes', [
      // ── Sabor da Serra (caseira)
      prato(rSerra, 'Arroz Branco', 'Arroz soltinho refogado com alho e cebola.', 'arrozbranco', 18.90),
      prato(rSerra, 'Feijão Carioca', 'Feijão temperado com bacon e louro.', 'feijaopreto', 22.50),
      prato(rSerra, 'Frango Assado', 'Coxa e sobrecoxa assadas no forno a lenha.', 'arrozbranco', 39.90, 150, 1000, 50),
      prato(rSerra, 'Macarrão ao Sugo', 'Espaguete ao molho de tomate caseiro com manjericão.', 'macarraoTomate', 24.90, 150, 1200, 50),
      prato(rSerra, 'Polenta Cremosa', 'Polenta de fubá cozida lentamente, finalizada com queijo.', 'arrozbranco', 21.00, 100, 800, 50),
      prato(rSerra, 'Salada da Horta', 'Mix de folhas, tomate, pepino e cenoura.', 'arrozbranco', 28.90, 100, 600, 50),
      prato(rSerra, 'Purê de Batata', 'Purê cremoso com manteiga e leite.', 'arrozbranco', 22.00, 100, 800, 50, false),

      // ── Galpão Gaúcho (churrascaria)
      prato(rGaucho, 'Picanha na Brasa', 'Picanha premium grelhada no carvão.', 'arrozbranco', 109.90, 200, 1500, 100),
      prato(rGaucho, 'Costela Bovina', 'Costela assada por 12 horas no fogo de chão.', 'feijaopreto', 89.90, 300, 2000, 100),
      prato(rGaucho, 'Linguiça Cuiabana', 'Linguiça artesanal levemente picante.', 'macarraoTomate', 59.90, 200, 1000, 100),
      prato(rGaucho, 'Frango com Bacon', 'Filé de frango envolto em bacon.', 'arrozbranco', 64.90, 150, 1200, 50),
      prato(rGaucho, 'Arroz de Carreteiro', 'Arroz com charque e bacon, tradição gaúcha.', 'arrozbranco', 42.00, 200, 1200, 100),
      prato(rGaucho, 'Maionese Tradicional', 'Maionese caseira com batata, cenoura e ovos.', 'arrozbranco', 28.00, 100, 800, 50),
      prato(rGaucho, 'Pão de Alho', 'Pão francês com manteiga de alho gratinado.', 'arrozbranco', 38.00, 100, 600, 50),

      // ── Cantina do Léo (italiana)
      prato(rLeo, 'Lasanha à Bolonhesa', 'Camadas de massa fresca com molho bolonhesa e queijo.', 'macarraoTomate', 69.90, 200, 1200, 100),
      prato(rLeo, 'Nhoque ao Sugo', 'Nhoque de batata caseiro ao molho de tomate.', 'macarraoTomate', 54.90, 200, 1000, 50),
      prato(rLeo, 'Ravióli de Ricota', 'Ravióli recheado com ricota e espinafre, molho de manteiga e sálvia.', 'macarraoTomate', 72.90, 150, 800, 50),
      prato(rLeo, 'Fettuccine Alfredo', 'Massa fresca com molho cremoso de queijo parmesão.', 'macarraoTomate', 64.90, 150, 1000, 50),
      prato(rLeo, 'Polpetone Recheado', 'Almôndega gigante recheada com mussarela.', 'arrozbranco', 78.90, 150, 800, 50),
      prato(rLeo, 'Salada Caprese', 'Tomate, mussarela de búfala e manjericão fresco.', 'arrozbranco', 49.90, 100, 600, 50),

      // ── Cozinha da Vovó (buffet por kg)
      prato(rVovo, 'Arroz Branco', 'Arroz tradicional da casa.', 'arrozbranco', 16.90),
      prato(rVovo, 'Feijão Preto', 'Feijão preto temperado com costelinha.', 'feijaopreto', 19.90),
      prato(rVovo, 'Carne de Panela', 'Acém cozido lentamente com legumes.', 'arrozbranco', 49.90, 150, 1000, 50),
      prato(rVovo, 'Estrogonofe de Frango', 'Frango ao molho cremoso com champignon.', 'arrozbranco', 44.90, 150, 1000, 50),
      prato(rVovo, 'Batata Frita', 'Batata frita crocante.', 'arrozbranco', 32.00, 100, 800, 50),
      prato(rVovo, 'Farofa Especial', 'Farofa com bacon, ovo e cebola caramelizada.', 'arrozbranco', 25.00, 100, 600, 50),
      prato(rVovo, 'Salada Mista', 'Alface, tomate, cenoura ralada e milho.', 'arrozbranco', 24.90, 100, 600, 50),
      prato(rVovo, 'Lasanha Quatro Queijos', 'Lasanha branca com mussarela, parmesão, provolone e gorgonzola.', 'macarraoTomate', 58.90, 200, 1000, 50),

      // ── Tempero Catarinense (regional)
      prato(rTempero, 'Camarão à Milanesa', 'Camarão empanado e frito, servido com limão.', 'arrozbranco', 119.90, 100, 800, 50),
      prato(rTempero, 'Sequência de Camarão', 'Camarão alho e óleo com arroz e pirão.', 'arrozbranco', 99.90, 150, 1000, 50),
      prato(rTempero, 'Tainha Assada', 'Tainha do litoral catarinense assada na folha de bananeira.', 'arrozbranco', 79.90, 200, 1200, 100),
      prato(rTempero, 'Pirão de Peixe', 'Pirão tradicional com caldo de peixe.', 'arrozbranco', 32.00, 100, 800, 50),
      prato(rTempero, 'Arroz de Polvo', 'Arroz com polvo desfiado e azeite.', 'arrozbranco', 89.90, 200, 1000, 100),
      prato(rTempero, 'Salada de Vagem', 'Vagem cozida com cebola e azeite extra virgem.', 'arrozbranco', 26.90, 100, 600, 50),

      // ── Marmita Fit (saudável)
      prato(rFit, 'Frango Grelhado', 'Filé de frango grelhado sem óleo.', 'arrozbranco', 49.90, 100, 800, 50),
      prato(rFit, 'Arroz Integral', 'Arroz integral cozido no ponto.', 'arrozbranco', 19.90, 100, 800, 50),
      prato(rFit, 'Batata Doce', 'Batata doce cozida em cubos.', 'arrozbranco', 22.90, 100, 800, 50),
      prato(rFit, 'Brócolis no Vapor', 'Brócolis ao vapor com alho.', 'arrozbranco', 28.90, 100, 500, 50),
      prato(rFit, 'Omelete de Claras', 'Omelete leve com claras e legumes.', 'arrozbranco', 39.90, 100, 500, 50),
      prato(rFit, 'Quinoa com Legumes', 'Quinoa cozida com cenoura, abobrinha e ervilha.', 'arrozbranco', 36.90, 100, 600, 50),
      prato(rFit, 'Salada de Atum', 'Atum, tomate, cebola roxa e azeite.', 'arrozbranco', 54.90, 100, 600, 50),

      // ── Cantinho do Peixe (frutos do mar)
      prato(rPeixe, 'Filé de Tilápia', 'Filé grelhado com limão e ervas.', 'arrozbranco', 72.90, 150, 1000, 50),
      prato(rPeixe, 'Moqueca de Peixe', 'Moqueca capixaba com leite de coco e dendê.', 'arrozbranco', 84.90, 200, 1200, 100),
      prato(rPeixe, 'Bobó de Camarão', 'Camarão ao creme de mandioca e leite de coco.', 'arrozbranco', 94.90, 200, 1000, 100),
      prato(rPeixe, 'Casquinha de Siri', 'Siri desfiado refogado com temperos.', 'arrozbranco', 78.90, 100, 500, 50),
      prato(rPeixe, 'Arroz com Brócolis', 'Arroz refogado com brócolis e alho.', 'arrozbranco', 28.90, 100, 800, 50),
      prato(rPeixe, 'Pirão Fresco', 'Pirão de peixe servido na hora.', 'arrozbranco', 26.00, 100, 600, 50),

      // ── Restaurante Mineiro do Centro
      prato(rMineiro, 'Feijão Tropeiro', 'Feijão com farinha, linguiça, bacon e couve.', 'feijaopreto', 42.90, 150, 1200, 50),
      prato(rMineiro, 'Frango com Quiabo', 'Frango caipira ensopado com quiabo.', 'arrozbranco', 54.90, 150, 1000, 50),
      prato(rMineiro, 'Tutu de Feijão', 'Feijão batido com farinha e bacon.', 'feijaopreto', 32.90, 100, 800, 50),
      prato(rMineiro, 'Couve à Mineira', 'Couve refogada no alho.', 'arrozbranco', 24.90, 100, 500, 50),
      prato(rMineiro, 'Arroz Branco', 'Arroz soltinho da casa.', 'arrozbranco', 17.90),
      prato(rMineiro, 'Torresmo Crocante', 'Torresmo de barriga frito na hora.', 'arrozbranco', 89.90, 100, 600, 50),
      prato(rMineiro, 'Mandioca Frita', 'Mandioca cozida e frita.', 'arrozbranco', 29.90, 100, 600, 50),
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // USUÁRIOS (Criciúma)
    // ─────────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('users', [
      { nome: 'Rafael Frassetto',  email: 'rafafrass@gmail.com',           senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Ana Lima',          email: 'ana.lima@email.com',            senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Carlos Silva',      email: 'carlos.silva@email.com',        senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Juliana Bertoldi',  email: 'juliana.bertoldi@email.com',    senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Bruno Bernardi',    email: 'bruno.bernardi@email.com',      senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Marina Costa',      email: 'marina.costa@email.com',        senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Felipe Pizzolo',    email: 'felipe.pizzolo@email.com',      senha: senhaCliente, created_at: now, updated_at: now },
      { nome: 'Camila Rocha',      email: 'camila.rocha@email.com',        senha: senhaCliente, created_at: now, updated_at: now },
    ]);

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users ORDER BY id ASC`
    );
    const uPor = (email) => users.find((u) => u.email === email).id;
    const uRafa    = uPor('rafafrass@gmail.com');
    const uAna     = uPor('ana.lima@email.com');
    const uCarlos  = uPor('carlos.silva@email.com');
    const uJuliana = uPor('juliana.bertoldi@email.com');
    const uBruno   = uPor('bruno.bernardi@email.com');
    const uMarina  = uPor('marina.costa@email.com');
    const uFelipe  = uPor('felipe.pizzolo@email.com');
    const uCamila  = uPor('camila.rocha@email.com');

    // ─────────────────────────────────────────────────────────────────────────
    // ENDEREÇOS (bairros de Criciúma)
    // ─────────────────────────────────────────────────────────────────────────
    const end = (user_id, apelido, rua, numero, complemento, cidade, estado, cep) => ({
      user_id, apelido, rua, numero, complemento, cidade, estado, cep,
      created_at: now, updated_at: now,
    });

    await queryInterface.bulkInsert('addresses', [
      end(uRafa,    'Casa',      'Rua Henrique Lage',           '420',  'Apto 302', 'Criciúma', 'SC', '88801-010'),
      end(uRafa,    'Trabalho',  'Av. Centenário',              '1500', 'Sala 12',  'Criciúma', 'SC', '88815-001'),
      end(uAna,     'Casa',      'Rua Cruz e Souza',            '180',  '',         'Criciúma', 'SC', '88802-330'),
      end(uCarlos,  'Casa',      'Rua Marechal Deodoro',        '850',  'Casa 2',   'Criciúma', 'SC', '88801-260'),
      end(uJuliana, 'Casa',      'Rua Coronel Pedro Benedet',   '300',  'Apto 504', 'Criciúma', 'SC', '88801-250'),
      end(uBruno,   'Casa',      'Av. Universitária',           '2100', '',         'Criciúma', 'SC', '88806-000'),
      end(uMarina,  'Casa',      'Rua Antônio De Lucca',        '75',   '',         'Criciúma', 'SC', '88811-510'),
      end(uFelipe,  'Casa',      'Rua João Pessoa',             '1230', 'Apto 102', 'Criciúma', 'SC', '88803-030'),
      end(uCamila,  'Casa',      'Rua Pascoal Meller',          '460',  '',         'Criciúma', 'SC', '88805-380'),
    ]);

    const [addresses] = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM addresses ORDER BY id ASC`
    );
    const endDoUsuario = (user_id) => addresses.find((a) => a.user_id === user_id).id;

    // ─────────────────────────────────────────────────────────────────────────
    // PEDIDOS DE EXEMPLO
    // ─────────────────────────────────────────────────────────────────────────
    const [dishes] = await queryInterface.sequelize.query(
      `SELECT id, restaurant_id, nome, preco_por_kg FROM dishes ORDER BY id ASC`
    );
    const dishPor = (restId, nome) =>
      dishes.find((d) => d.restaurant_id === restId && d.nome === nome);

    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    const semanaPassada = new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000);

    // Pedido 1: Rafael, Sabor da Serra, entregue
    const arrozSerra = dishPor(rSerra, 'Arroz Branco');
    const feijaoSerra = dishPor(rSerra, 'Feijão Carioca');
    const frangoSerra = dishPor(rSerra, 'Frango Assado');

    // Pedido 2: Ana, Cantina do Léo, em preparo
    const lasanhaLeo = dishPor(rLeo, 'Lasanha à Bolonhesa');
    const saladaLeo = dishPor(rLeo, 'Salada Caprese');

    // Pedido 3: Carlos, Galpão Gaúcho, saiu para entrega
    const picanha = dishPor(rGaucho, 'Picanha na Brasa');
    const carreteiro = dishPor(rGaucho, 'Arroz de Carreteiro');

    // Pedido 4: Juliana, Marmita Fit, entregue (semana passada)
    const frangoFit = dishPor(rFit, 'Frango Grelhado');
    const batataDoce = dishPor(rFit, 'Batata Doce');
    const brocolis = dishPor(rFit, 'Brócolis no Vapor');

    // Pedido 5: Bruno, Cozinha da Vovó, cancelado
    const estrogonofe = dishPor(rVovo, 'Estrogonofe de Frango');

    const valor = (d, g) => Number((Number(d.preco_por_kg) * (g / 1000)).toFixed(2));

    const pedido1Itens = [
      { dish: arrozSerra,  g: 250 },
      { dish: feijaoSerra, g: 200 },
      { dish: frangoSerra, g: 300 },
    ];
    const pedido2Itens = [
      { dish: lasanhaLeo, g: 500 },
      { dish: saladaLeo,  g: 200 },
    ];
    const pedido3Itens = [
      { dish: picanha,    g: 400 },
      { dish: carreteiro, g: 350 },
    ];
    const pedido4Itens = [
      { dish: frangoFit,  g: 250 },
      { dish: batataDoce, g: 200 },
      { dish: brocolis,   g: 150 },
    ];
    const pedido5Itens = [
      { dish: estrogonofe, g: 400 },
    ];

    const totalDe = (itens) =>
      Number(itens.reduce((s, i) => s + valor(i.dish, i.g), 0).toFixed(2));

    await queryInterface.bulkInsert('orders', [
      { user_id: uRafa,    address_id: endDoUsuario(uRafa),    status: 'Entregue',          total: totalDe(pedido1Itens), created_at: ontem,         updated_at: ontem },
      { user_id: uAna,     address_id: endDoUsuario(uAna),     status: 'Em preparo',        total: totalDe(pedido2Itens), created_at: hoje,          updated_at: hoje },
      { user_id: uCarlos,  address_id: endDoUsuario(uCarlos),  status: 'Saiu para entrega', total: totalDe(pedido3Itens), created_at: hoje,          updated_at: hoje },
      { user_id: uJuliana, address_id: endDoUsuario(uJuliana), status: 'Entregue',          total: totalDe(pedido4Itens), created_at: semanaPassada, updated_at: semanaPassada },
      { user_id: uBruno,   address_id: endDoUsuario(uBruno),   status: 'Cancelado',         total: totalDe(pedido5Itens), created_at: ontem,         updated_at: ontem },
    ]);

    const [orders] = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM orders ORDER BY id ASC`
    );
    const orderDoUsuario = (user_id) => orders.find((o) => o.user_id === user_id).id;

    const linhasItens = [];
    const empilhar = (orderId, itens) => {
      itens.forEach(({ dish, g }) => {
        linhasItens.push({
          order_id: orderId,
          dish_id: dish.id,
          nome_snapshot: dish.nome,
          quantidade_g: g,
          preco_por_kg_snapshot: dish.preco_por_kg,
          preco_total: valor(dish, g),
          observacao: null,
          created_at: now,
          updated_at: now,
        });
      });
    };

    empilhar(orderDoUsuario(uRafa),    pedido1Itens);
    empilhar(orderDoUsuario(uAna),     pedido2Itens);
    empilhar(orderDoUsuario(uCarlos),  pedido3Itens);
    empilhar(orderDoUsuario(uJuliana), pedido4Itens);
    empilhar(orderDoUsuario(uBruno),   pedido5Itens);

    await queryInterface.bulkInsert('order_items', linhasItens);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('addresses', null, {});
    await queryInterface.bulkDelete('dishes', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
  },
};
