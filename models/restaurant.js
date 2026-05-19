'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.hasMany(models.Dish, {
        foreignKey: 'restaurant_id',
        as: 'dishes',
        onDelete: 'CASCADE',
      });
    }
  }
  Restaurant.init(
    {
      nome: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      telefone: DataTypes.STRING,
      cnpj: { type: DataTypes.STRING, unique: true },
      senha: { type: DataTypes.STRING, allowNull: false },
      auth_id: { type: DataTypes.UUID, allowNull: true },
      aberto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'restaurants',
      underscored: true,
    }
  );
  return Restaurant;
};
