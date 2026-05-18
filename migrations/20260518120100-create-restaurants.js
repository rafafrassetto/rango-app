'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restaurants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      telefone: Sequelize.STRING,
      cnpj: { type: Sequelize.STRING, unique: true },
      senha: { type: Sequelize.STRING, allowNull: false },
      auth_id: { type: Sequelize.UUID, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('restaurants', ['email'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('restaurants');
  },
};
