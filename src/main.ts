import express from 'express';
import { RouteHandler } from './routes';
import logger from './helpers/logger.service';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

new RouteHandler(app);

app.listen(3000, () => {
    logger.info('Server listening on port', 3000);
})