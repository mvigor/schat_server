'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ChatRoom,{  foreignKey: 'room_id', as: 'chat' });
      this.belongsTo(models.Users,{ foreignKey: 'user_id', as: 'user' })
    }
  };
  ChatLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    timestamp: DataTypes.DATE,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ChatLog',
  });
  return ChatLog;
};
