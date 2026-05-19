'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Address.hasMany(models.Order, { foreignKey: 'address_id', as: 'orders' });
    }
  }
  Address.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      apelido: DataTypes.STRING,
      rua: { type: DataTypes.STRING, allowNull: false },
      numero: DataTypes.STRING,
      bairro: { type: DataTypes.STRING(100), allowNull: true },
      complemento: DataTypes.STRING,
      cidade: { type: DataTypes.STRING, allowNull: false },
      estado: { type: DataTypes.STRING, allowNull: false },
      cep: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Address',
      tableName: 'addresses',
      underscored: true,
    }
  );
  return Address;
};
