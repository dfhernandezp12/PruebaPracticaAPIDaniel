import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishEntity } from './dish.entity';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DishEntity])],
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule {}
