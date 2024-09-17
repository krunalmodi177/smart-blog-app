import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AdminAttributes {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    passwordResetOtp?: string;
    otpExpiresAt?: Date | null;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id'> { }

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
    public id!: number;
    public firstname!: string;
    public lastname!: string;
    public email!: string;
    public password!: string;
    public passwordResetOtp?: string;
    public otpExpiresAt?: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

}
function initializeAdmin(sequelize: Sequelize) {
    Admin.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            passwordResetOtp: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            otpExpiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'Admin',
            tableName: 'admin',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            paranoid: true,
        }
    )
    return Admin;
}

export { Admin, AdminAttributes, AdminCreationAttributes, initializeAdmin }