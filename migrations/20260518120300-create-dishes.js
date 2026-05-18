'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dishes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      restaurant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'restaurants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nome: { type: Sequelize.STRING, allowNull: false },
      descricao: Sequelize.TEXT,
      imagem_key: Sequelize.STRING,
      imagem_url: Sequelize.STRING,
      preco_por_kg: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      peso_min_g: { type: Sequelize.INTEGER, defaultValue: 100 },
      peso_max_g: { type: Sequelize.INTEGER, defaultValue: 2000 },
      passo_g: { type: Sequelize.INTEGER, defaultValue: 50 },
      disponivel: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('dishes', ['restaurant_id']);
    await queryInterface.addIndex('dishes', ['disponivel']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('dishes');
  },
};
