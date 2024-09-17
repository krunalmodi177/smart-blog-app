import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface CategoryAttributes {
    id: number;
    name: string;
    isDeleted?: boolean
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> { }

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryCreationAttributes {
    public id!: number;
    public name!: string;
    public isDeleted?: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        Category.hasMany(models.Blog, {as: 'blogs', foreignKey: 'categoryId'})
    }
}


function initializeCategory(sequelize: Sequelize) {
    Category.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'category',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            paranoid: true,
        }
    )
    return Category;
}

export { Category, CategoryAttributes, CategoryCreationAttributes, initializeCategory }
