import { NestFactory } from '@nestjs/core';
import { AppModule } from './interfaces/modules/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://172.20.0.1:4200',
      'http://192.168.1.153:4200',
    'http://localhost:4200'],
    credentials: true,
  });
  // app.useWebSocketAdapter(new IoAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // await app.listen(3000, '192.168.1.153');
   await app.listen(3000);
}
bootstrap();
