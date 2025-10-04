import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { ValidationPipe } from "@nestjs/common";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle("Circuito BR 116 API")
    .addServer('http://localhost:8081', 'Local environment')
    .addServer('https://your-production-url.com', 'Production environment')
    .setDescription("API documentation for Circuito BR 116")
    .setVersion("1.0")
    .addTag("Home")
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const swaggerFilePath = path.resolve(__dirname, "../swagger.json");
  fs.writeFileSync(swaggerFilePath, JSON.stringify(document, null, 2), "utf-8");

  SwaggerModule.setup("api-docs", app, document);

  const port = process.env.PORT || 8081;
  await app.listen(port);
}
bootstrap();
