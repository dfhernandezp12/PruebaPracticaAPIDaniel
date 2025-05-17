import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DishEntity } from './dish.entity';
import { Repository } from 'typeorm';
import { DishDto } from './dish.dto';
import { plainToInstance } from 'class-transformer';
import { DishCategory } from './enums/dish-category.enum';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(DishEntity)
    private dishRepository: Repository<DishEntity>,
  ) {}

  create(dto: DishDto): Promise<DishEntity> {
    this.checkCategory(dto.category);
    const dish = this.dishRepository.create(plainToInstance(DishEntity, dto));
    return this.dishRepository.save(dish);
  }

  findAll(): Promise<DishEntity[]> {
    return this.dishRepository.find({ relations: ['restaurants'] });
  }

  async findOne(id: string): Promise<DishEntity> {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ['restaurants'],
    });
    if (!dish)
      throw new BusinessLogicException(
        'Dish not found',
        BusinessError.NOT_FOUND,
      );
    return dish;
  }

  async update(id: string, dto: DishDto): Promise<DishEntity> {
    this.checkCategory(dto.category);
    const dish = await this.findOne(id);
    Object.assign(dish, dto);
    return this.dishRepository.save(dish);
  }

  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepository.remove(dish);
  }

  checkCategory(category: string) {
    if (
      !category ||
      !Object.values(DishCategory).includes(category as DishCategory)
    ) {
      throw new BusinessLogicException(
        'Invalid category',
        BusinessError.BAD_REQUEST,
      );
    }
  }
  /*  checkType(type:string) {
      if (!type||!Object.values(RestaurantType).includes(type as RestaurantType)) {
          throw new BusinessLogicException('Invalid type',
              BusinessError.BAD_REQUEST
          );
        }
    } */
}
