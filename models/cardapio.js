'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cardapio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Cardapio.init({
    Nome: DataTypes.STRING,
    idComida: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cardapio',
  });
  return Cardapio;
};