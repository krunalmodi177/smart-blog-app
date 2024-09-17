import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Category } from './category';

interface BlogAttributes {
    id: number;
    title: string;
    content: string;
    image: string;
    categoryId: number;
    isDeleted: boolean
}

interface BlogCreationAttributes extends Optional<BlogAttributes, 'id'> { }

class Blog extends Model<BlogAttributes, BlogCreationAttributes> implements BlogCreationAttributes {
    public id!: number;
    public title!: string;
    public content!: string;
    public image!: string;
    public categoryId!: number;
    public isDeleted!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly category?: Category;

    static associate(models: any) {
        Blog.belongsTo(models.Category, {as: 'category', foreignKey: 'categoryId'})
    }
}


function initializeBlog(sequelize: Sequelize) {
    Blog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {model: 'category', key: 'id'},
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Blog',
            tableName: 'blog',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            paranoid: true,
        }
    )
    return Blog;
}

export { Blog, BlogAttributes, BlogCreationAttributes, initializeBlog }
