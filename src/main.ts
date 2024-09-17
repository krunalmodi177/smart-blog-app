import express from 'express';
import i18n from './i18n';
import { parse } from 'accept-language-parser';
import { RouteHandler } from './routes';
import logger from './helpers/logger.service';
import { CommonHelperService } from './helpers/commonHelper.service';
import { Messages } from './helpers/messages';
import { sequelize } from './database/models';
const port = process.env.PORT || 3002;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(i18n.init);

app.use((req, res, next) => {
    const languages = parse(req.headers['accept-language']);
    const preferredLanguage = languages[0]?.code || 'en';

    i18n.setLocale(preferredLanguage);
    next();
});
new RouteHandler(app);

app.get('/health', async (req, res) => {
    const commonHelper = new CommonHelperService();
    try {
        // const result = await prisma.$queryRawUnsafe(`SELECT 1+1`);
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return commonHelper.sendResponse(res, 200, undefined, 'Server is healthy');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
})

app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
})