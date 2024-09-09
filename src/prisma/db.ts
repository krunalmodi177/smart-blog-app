import { Prisma, PrismaClient } from '@prisma/client';
import { createPrismaQueryEventHandler } from 'prisma-query-log';

const isLogsEnabled = process.env.DB_LOG_ENABLED === 'true';

let prisma: PrismaClient<Prisma.PrismaClientOptions, 'query'>;

if (isLogsEnabled) {
  prisma = new PrismaClient({
    log: [
      {
        level: 'query',
        emit: 'event',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });
  const log = createPrismaQueryEventHandler();
  prisma.$on('query', log);
} else {
  prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
}

export default prisma;
