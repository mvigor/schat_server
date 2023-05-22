'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InviteLinks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ChatRoom,{ foreignKey: 'room_id', as: 'room' })
    }
  };
  InviteLinks.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      notNull: true,
      autoIncrement: true,
    },
    room_id: DataTypes.INTEGER,
    link: DataTypes.STRING,
    disabled: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    }
  }, {
    sequelize,
    modelName: 'InviteLinks',
  });
  return InviteLinks;
};
