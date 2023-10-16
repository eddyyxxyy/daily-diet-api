import { app } from './app';
import { env } from './env';

app
  .listen({ port: env.PORT })
  .then(() => console.log('HTTP Server running at port: ' + env.PORT));
