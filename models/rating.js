'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
      Rating.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Rating.init(
    {
      order_id: { type: DataTypes.INTEGER, allowNull: true },
      restaurant_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      nota_entrega: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      nota_restaurante: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      comentario: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'ratings',
      underscored: true,
    }
  );
  return Rating;
};
