import express from 'express';
import { RouteHandler } from './routes';
import logger from './helpers/logger.service';
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

new RouteHandler(app);

app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
})