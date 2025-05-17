import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantDto } from './restaurant.dto';
import { plainToInstance } from 'class-transformer';
import { RestaurantType } from './enums/restaurant-type.enum';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  create(dto: RestaurantDto): Promise<RestaurantEntity> {
    this.checkType(dto.type);
    const restaurant = this.restaurantRepository.create(plainToInstance(RestaurantEntity,dto));
    return this.restaurantRepository.save(restaurant);
  }

  findAll(): Promise<RestaurantEntity[]> {
    return this.restaurantRepository.find({ relations: ['dishes'] });
  }

  async findOne(id: string): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
    where: { id },
    relations: ['dishes'],
  });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async update(id: string, dto: RestaurantDto): Promise<RestaurantEntity> {
    this.checkType(dto.type)
    const restaurant = await this.findOne(id);
    const updated = Object.assign(restaurant, dto);
    return this.restaurantRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantRepository.remove(restaurant);
  }

  checkType(type:string) {
    if (!type||!Object.values(RestaurantType).includes(type as RestaurantType)) {
        throw new BusinessLogicException('Invalid type',
            BusinessError.BAD_REQUEST
        );
      }
  }
}
