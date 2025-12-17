import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); // Reflector Interceptor must be called before listen
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();