'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // bairro em addresses
    await queryInterface.addColumn('addresses', 'bairro', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
      after: 'numero',
    });

    // aberto em restaurants
    await queryInterface.addColumn('restaurants', 'aberto', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // forma_pagamento em orders
    await queryInterface.addColumn('orders', 'forma_pagamento', {
      type: Sequelize.ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix'),
      allowNull: true,
      defaultValue: null,
    });

    // taxa_entrega em orders
    await queryInterface.addColumn('orders', 'taxa_entrega', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'taxa_entrega');
    await queryInterface.removeColumn('orders', 'forma_pagamento');
    await queryInterface.removeColumn('restaurants', 'aberto');
    await queryInterface.removeColumn('addresses', 'bairro');
  },
};
