import { Sequelize, SyncOptions } from 'sequelize';
import config from '../config/config';
import { Admin, initializeAdmin } from './admin'
import { Category, initializeCategory } from './category';
import { Blog, initializeBlog } from './blog';
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];


const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: console.log,
  sync: dbConfig.sync,
  pool: dbConfig.pool
});

const db: any = {
  db:sequelize,

  Admin: initializeAdmin(sequelize),
  Category: initializeCategory(sequelize),
  Blog: initializeBlog(sequelize)
};

sequelize
  .authenticate()
  .then(() => {
    console.info('Database connected');
  })
  .catch((error) => {
    console.error('Error while try to connect with database:', error);
  });

function initializeDatabase(dbObj: any) {
  Object.keys(dbObj).forEach((modelName) => {
    if (dbObj[modelName].associate) {
      dbObj[modelName].associate(dbObj);
    }
    if (dbObj[modelName].seed) {
      dbObj[modelName].seed(dbObj);
    }
  });
}

if (dbConfig.sync.alter) {
  sequelize
    .sync({ force: dbConfig.sync.force, alter: dbConfig.sync.alter })
    .then(async() => {  
      initializeDatabase(db);
      console.info('Database synchronized');
    })
    .catch((error) => {
      console.log("🚀 ~ error:", error)
      if (error) {
        console.error('An error occurred in synchronization: ', error);
      }
    });
} else {
  initializeDatabase(db);
}

export { Sequelize, sequelize };