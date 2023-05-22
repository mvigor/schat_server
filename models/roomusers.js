'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ ChatRoom, Users }) {
      this.belongsTo( ChatRoom, { foreignKey: 'room_id', as: 'room' });
      this.belongsTo( Users, { foreignKey: 'user_id', as: 'user' });
    }
  };
  RoomUsers.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id:{
     type: DataTypes.INTEGER,
      allowNull: false
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    } ,
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    linkId: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'RoomUsers',
  });
  return RoomUsers;
};
