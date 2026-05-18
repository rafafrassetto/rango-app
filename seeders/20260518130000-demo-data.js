'use strict';

module.exports = {
  async up(queryInterface) {
    // ── Restaurantes ──────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('restaurants', [
      {
        nome: 'Sabor da Terra',
        email: 'contato@sabordaterra.com.br',
        telefone: '(11) 91234-5678',
        cnpj: '12.345.678/0001-90',
        senha: 'restaurante123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Churrascaria Gaúcha',
        email: 'contato@churrascariagaucha.com.br',
        telefone: '(11) 98765-4321',
        cnpj: '98.765.432/0001-10',
        senha: 'restaurante123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [restaurants] = await queryInterface.sequelize.query(
      `SELECT id, nome FROM restaurants ORDER BY id ASC LIMIT 2`
    );
    const r1 = restaurants[0].id;
    const r2 = restaurants[1].id;

    // ── Pratos – Sabor da Terra ───────────────────────────────────────────────
    await queryInterface.bulkInsert('dishes', [
      {
        restaurant_id: r1,
        nome: 'Arroz Branco',
        descricao: 'Arroz soltinho cozido com alho e sal.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 18.90,
        peso_min_g: 100,
        peso_max_g: 1000,
        passo_g: 50,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r1,
        nome: 'Feijão Preto',
        descricao: 'Feijão preto temperado com bacon e louro.',
        imagem_key: 'feijaopreto',
        preco_por_kg: 22.50,
        peso_min_g: 100,
        peso_max_g: 800,
        passo_g: 50,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r1,
        nome: 'Macarrão ao Molho de Tomate',
        descricao: 'Macarrão espaguete com molho de tomate caseiro.',
        imagem_key: 'macarraoTomate',
        preco_por_kg: 25.00,
        peso_min_g: 200,
        peso_max_g: 1200,
        passo_g: 100,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r1,
        nome: 'Frango Grelhado',
        descricao: 'Peito de frango temperado na chapa.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 38.90,
        peso_min_g: 150,
        peso_max_g: 800,
        passo_g: 50,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r1,
        nome: 'Salada Tropical',
        descricao: 'Mix de folhas, tomate cereja e molho de limão.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 29.90,
        peso_min_g: 100,
        peso_max_g: 600,
        passo_g: 50,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r1,
        nome: 'Purê de Batata',
        descricao: 'Purê cremoso com manteiga e leite.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 20.00,
        peso_min_g: 100,
        peso_max_g: 800,
        passo_g: 50,
        disponivel: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // ── Pratos – Churrascaria Gaúcha ──────────────────────────────────────────
    await queryInterface.bulkInsert('dishes', [
      {
        restaurant_id: r2,
        nome: 'Picanha na Brasa',
        descricao: 'Picanha premium grelhada no carvão.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 89.90,
        peso_min_g: 200,
        peso_max_g: 1500,
        passo_g: 100,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r2,
        nome: 'Costela Defumada',
        descricao: 'Costela bovina defumada por 12 horas.',
        imagem_key: 'feijaopreto',
        preco_por_kg: 79.90,
        peso_min_g: 300,
        peso_max_g: 2000,
        passo_g: 100,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r2,
        nome: 'Linguiça Gaúcha',
        descricao: 'Linguiça artesanal temperada à moda gaúcha.',
        imagem_key: 'macarraoTomate',
        preco_por_kg: 55.00,
        peso_min_g: 200,
        peso_max_g: 1000,
        passo_g: 100,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r2,
        nome: 'Arroz de Carreteiro',
        descricao: 'Arroz com carne seca e bacon.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 42.00,
        peso_min_g: 200,
        peso_max_g: 1200,
        passo_g: 100,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        restaurant_id: r2,
        nome: 'Salada de Maionese',
        descricao: 'Maionese caseira com legumes e ovos.',
        imagem_key: 'arrozbranco',
        preco_por_kg: 28.00,
        peso_min_g: 100,
        peso_max_g: 800,
        passo_g: 50,
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // ── Usuários ──────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('users', [
      {
        nome: 'Rafael Frassetto',
        email: 'rafafrass@gmail.com',
        senha: 'teste123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Ana Lima',
        email: 'ana.lima@email.com',
        senha: 'teste123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Carlos Silva',
        email: 'carlos.silva@email.com',
        senha: 'teste123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // ── Endereços ─────────────────────────────────────────────────────────────
    const [[user1]] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'rafafrass@gmail.com' LIMIT 1`
    );

    await queryInterface.bulkInsert('addresses', [
      {
        user_id: user1.id,
        rua: 'Rua das Flores',
        numero: '123',
        complemento: 'Apto 42',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: user1.id,
        rua: 'Av. Paulista',
        numero: '1578',
        complemento: '',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-200',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('addresses', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('dishes', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
  },
};
