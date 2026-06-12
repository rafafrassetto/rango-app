'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dishes', 'imagem_url', {
      type: Sequelize.TEXT, allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dishes', 'imagem_url', {
      type: Sequelize.STRING, allowNull: true,
    });
  },
};
