'use strict';
const { Model } = require('sequelize');

const STATUS = ['Em preparo', 'Saiu para entrega', 'Entregue', 'Cancelado'];

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Order.belongsTo(models.Address, { foreignKey: 'address_id', as: 'address' });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items',
        onDelete: 'CASCADE',
      });
    }
  }
  Order.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      address_id: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.ENUM(...STATUS),
        defaultValue: 'Em preparo',
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      forma_pagamento: {
        type: DataTypes.ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix'),
        allowNull: true,
      },
      taxa_entrega: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      underscored: true,
    }
  );
  Order.STATUS = STATUS;
  return Order;
};
