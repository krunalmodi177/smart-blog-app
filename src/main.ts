import express from 'express';
import { RouteHandler } from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

new RouteHandler(app);

app.listen(3000, () => {
    console.log('Server listening on port', 3000);
})