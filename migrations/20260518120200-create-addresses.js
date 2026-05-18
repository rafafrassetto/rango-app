'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      apelido: Sequelize.STRING,
      rua: { type: Sequelize.STRING, allowNull: false },
      numero: Sequelize.STRING,
      complemento: Sequelize.STRING,
      cidade: { type: Sequelize.STRING, allowNull: false },
      estado: { type: Sequelize.STRING, allowNull: false },
      cep: Sequelize.STRING,
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('addresses', ['user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('addresses');
  },
};
