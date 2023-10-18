import { app } from './app';
import { env } from './env';

app
  .listen({ port: env.PORT })
  // eslint-disable-next-line no-console
  .then(() => console.log('HTTP Server running at port: ' + env.PORT));
