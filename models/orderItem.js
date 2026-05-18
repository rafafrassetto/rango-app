'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      OrderItem.belongsTo(models.Dish, { foreignKey: 'dish_id', as: 'dish' });
    }
  }
  OrderItem.init(
    {
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      dish_id: { type: DataTypes.INTEGER, allowNull: false },
      nome_snapshot: DataTypes.STRING,
      quantidade_g: { type: DataTypes.INTEGER, allowNull: false },
      preco_por_kg_snapshot: DataTypes.DECIMAL(10, 2),
      preco_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      observacao: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      underscored: true,
    }
  );
  return OrderItem;
};
