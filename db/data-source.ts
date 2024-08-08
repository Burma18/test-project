import { User } from '../src/users/user.entity';
import { Article } from '../src/articles/article.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  entities: [User, Article],
  migrations: [__dirname + '/migrations/**/*.{js,ts}'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
