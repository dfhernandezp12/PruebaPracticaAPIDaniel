import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { DishModule } from './dish/dish.module';
import { RestaurantEntity } from './restaurant/restaurant.entity';
import { DishEntity } from './dish/dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantDishModule } from './restaurant-dish/restaurant-dish.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'pruebapractica',
      entities: [RestaurantEntity, DishEntity],
      dropSchema: true,
      synchronize: true,
    }),
    RestaurantModule,
    DishModule,
    RestaurantDishModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
