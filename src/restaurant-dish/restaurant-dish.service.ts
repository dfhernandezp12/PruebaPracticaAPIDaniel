import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { DishEntity } from '../dish/dish.entity';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class RestaurantDishService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @InjectRepository(DishEntity)
    private readonly dishRepository: Repository<DishEntity>,
  ) {}

  async addDishToRestaurant(
    restaurantId: string,
    dishId: string,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['dishes'],
    });
    if (!restaurant)
      throw new BusinessLogicException(
        'Restaurant not found',
        BusinessError.NOT_FOUND,
      );

    const dish = await this.dishRepository.findOneBy({ id: dishId });
    if (!dish)
      throw new BusinessLogicException(
        'Dish not found',
        BusinessError.NOT_FOUND,
      );

    restaurant.dishes.push(dish);
    return await this.restaurantRepository.save(restaurant);
  }

  async findDishesFromRestaurant(restaurantId: string): Promise<DishEntity[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['dishes'],
    });
    if (!restaurant)
      throw new BusinessLogicException(
        'Restaurant not found',
        BusinessError.NOT_FOUND,
      );

    return restaurant.dishes;
  }

  async findDishFromRestaurant(
    restaurantId: string,
    dishId: string,
  ): Promise<DishEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['dishes'],
    });
    if (!restaurant)
      throw new BusinessLogicException(
        'Restaurant not found',
        BusinessError.NOT_FOUND,
      );

    const dish = restaurant.dishes.find((d) => d.id === dishId);
    if (!dish)
      throw new BusinessLogicException(
        'Dish not associated with restaurant',
        BusinessError.NOT_FOUND,
      );

    return dish;
  }

  async updateDishesFromRestaurant(
    restaurantId: string,
    dishIds: string[],
  ): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['dishes'],
    });
    if (!restaurant)
      throw new BusinessLogicException(
        'Restaurant not found',
        BusinessError.NOT_FOUND,
      );

    const dishes = await this.dishRepository.findByIds(dishIds);
    if (dishes.length !== dishIds.length)
      throw new BusinessLogicException(
        'One or more dishes not found',
        BusinessError.NOT_FOUND,
      );

    restaurant.dishes = dishes;
    return await this.restaurantRepository.save(restaurant);
  }

  async deleteDishFromRestaurant(
    restaurantId: string,
    dishId: string,
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['dishes'],
    });
    if (!restaurant)
      throw new BusinessLogicException(
        'Restaurant not found',
        BusinessError.NOT_FOUND,
      );

    const dishIndex = restaurant.dishes.findIndex((d) => d.id === dishId);
    if (dishIndex === -1) {
      throw new BusinessLogicException(
        'Dish not associated with restaurant',
        BusinessError.NOT_FOUND,
      );
    }

    restaurant.dishes.splice(dishIndex, 1);
    await this.restaurantRepository.save(restaurant);
  }
}
