'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dish_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'dishes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nome_snapshot: Sequelize.STRING,
      quantidade_g: { type: Sequelize.INTEGER, allowNull: false },
      preco_por_kg_snapshot: Sequelize.DECIMAL(10, 2),
      preco_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      observacao: Sequelize.TEXT,
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['dish_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
