import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe , VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.enableCors({
    origin: function (origin : unknown, callback: (arg0: null, arg1: boolean) => void) {
    console.log('Incoming Origin:', origin); 
    callback( null ,true); 
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  app.use(cookieParser());
  await app.listen(3000);
}

void bootstrap();
