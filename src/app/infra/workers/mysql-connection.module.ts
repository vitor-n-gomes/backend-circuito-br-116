import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * MySQL Connection Module for Legacy Database
 * Uses a named connection to connect to the legacy MySQL database
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      name: 'mysql_legacy', // Named connection for MySQL
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get('MYSQL_HOST', 'localhost'),
        port: configService.get<number>('MYSQL_PORT', 3306),
        username: configService.get('MYSQL_USER', 'root'),
        password: configService.get('MYSQL_PASS', ''),
        database: configService.get('MYSQL_DB', 'legacy_db'),
        entities: [
          'src/app/infra/workers/legacy-models/**/*.entity.{ts,js}',
        ],
        synchronize: false, // Never sync - read-only
        logging: configService.get('MYSQL_LOGGING', 'false') === 'true',
        timezone: '+00:00',
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class MySQLConnectionModule {}
