'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(
          models.InviteLinks,
          {
            foreignKey: 'room_id',
            as: 'links'
          });
      this.hasMany(
          models.ChatLog,
          {
            foreignKey: 'room_id',
            as: 'log'
          });
    }
  };
  ChatRoom.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    admin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ChatRoom',
  });
  return ChatRoom;
};
