'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL' },
      restaurant_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      nota_entrega: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      nota_restaurante: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      comentario: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ratings');
  },
};
