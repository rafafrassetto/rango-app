'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      Dish.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Dish.hasMany(models.OrderItem, {
        foreignKey: 'dish_id',
        as: 'order_items',
      });
    }
  }
  Dish.init(
    {
      restaurant_id: { type: DataTypes.INTEGER, allowNull: false },
      nome: { type: DataTypes.STRING, allowNull: false },
      descricao: DataTypes.TEXT,
      imagem_key: DataTypes.STRING,
      imagem_url: DataTypes.STRING,
      preco_por_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      peso_min_g: { type: DataTypes.INTEGER, defaultValue: 100 },
      peso_max_g: { type: DataTypes.INTEGER, defaultValue: 2000 },
      passo_g: { type: DataTypes.INTEGER, defaultValue: 50 },
      disponivel: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Dish',
      tableName: 'dishes',
      underscored: true,
    }
  );
  return Dish;
};
