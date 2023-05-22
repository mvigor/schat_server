'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  };
  Users.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nickname: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true
    },
    login_key: {
      type: DataTypes.STRING(255)
    },
    admin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    disabled: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};
