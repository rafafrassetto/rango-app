'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tabela = await queryInterface.describeTable('restaurants');
    if (!tabela.reset_token) {
      await queryInterface.addColumn('restaurants', 'reset_token', {
        type: Sequelize.STRING, allowNull: true,
      });
    }
    if (!tabela.reset_token_expira) {
      await queryInterface.addColumn('restaurants', 'reset_token_expira', {
        type: Sequelize.DATE, allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('restaurants', 'reset_token');
    await queryInterface.removeColumn('restaurants', 'reset_token_expira');
  },
};
