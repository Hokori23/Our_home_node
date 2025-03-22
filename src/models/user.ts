import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeToZod } from '@/utils/sequelizeToZod';
import sequelize from '@/database';

interface UserAttributes {
  id: number;
  account: string;
  password: string;
  nickName?: string;
  associatedUid?: number;
  avatar?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public account!: string;
  public password!: string;
  public nickName?: string;
  public associatedUid?: number;
  public avatar?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    account: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nickName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    associatedUid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  },
);

// 生成 Zod schema
export const UserSchema = sequelizeToZod(User.getAttributes());

export default User;
