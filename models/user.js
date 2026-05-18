'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Address, {
        foreignKey: 'user_id',
        as: 'addresses',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders',
      });
    }
  }
  User.init(
    {
      nome: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      senha: { type: DataTypes.STRING, allowNull: false },
      auth_id: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  );
  return User;
};
