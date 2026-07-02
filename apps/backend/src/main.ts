import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe , VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { BadRequestException } from '@nestjs/common';

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
  new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(
        (err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`
      );
      return new BadRequestException(messages);
    },
  }),
);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  app.use(cookieParser());
  await app.listen(3000);
}

void bootstrap();

//main.ts is main file of backend. In that file i specified for backend to use cookies to have versioning type uri and prefix v and configurated validation pipes for understanble erros and cors to only handle request from frontend