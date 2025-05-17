import {
  Controller,
  Post,
  Param,
  Get,
  Delete,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { RestaurantDishService } from './restaurant-dish.service';
import { DishEntity } from '../dish/dish.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('restaurants')
@UseInterceptors(BusinessErrorsInterceptor)
export class RestaurantDishController {
  constructor(private readonly restaurantDishService: RestaurantDishService) {}

  @Post(':restaurantId/dishes/:dishId')
  async addDishToRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return await this.restaurantDishService.addDishToRestaurant(
      restaurantId,
      dishId,
    );
  }

  @Get(':restaurantId/dishes')
  async findDishesFromRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<DishEntity[]> {
    return await this.restaurantDishService.findDishesFromRestaurant(
      restaurantId,
    );
  }

  @Get(':restaurantId/dishes/:dishId')
  async findDishFromRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ): Promise<DishEntity> {
    return await this.restaurantDishService.findDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }

  @Put(':restaurantId/dishes')
  async updateDishesFromRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() dishIds: string[],
  ) {
    return await this.restaurantDishService.updateDishesFromRestaurant(
      restaurantId,
      dishIds,
    );
  }

  @Delete(':restaurantId/dishes/:dishId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDishFromRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return await this.restaurantDishService.deleteDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }
}
