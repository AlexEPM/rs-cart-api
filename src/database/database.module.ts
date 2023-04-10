import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import {OrderEntity} from "./entities/order.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: ['/dist/database/entities/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            synchronize: true,
            /**
             * Flag to show all generated sql queries on each interaction with DB.
             * Should be omitted for production.
             */
            logging: true,
            /**
             * This naming strategy will map field_name from database to fieldName inside application.
             */
            namingStrategy: new SnakeNamingStrategy(),
        }),
        TypeOrmModule.forFeature([CartEntity, CartItemEntity, OrderEntity]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
