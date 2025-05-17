import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantService } from './restaurant.service';
import { RestaurantEntity } from './restaurant.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { RestaurantType } from './enums/restaurant-type.enum';
import { RestaurantDto } from './restaurant.dto';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let repository: Repository<RestaurantEntity>;
  let restaurantsList: RestaurantEntity[] = [];

  const seedDatabase = async () => {
    await repository.clear();
    restaurantsList = [];

    for (let i = 0; i < 5; i++) {
      const restaurant = await repository.save({
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        type: RestaurantType.INTERNACIONAL,
        website:'website.com',
        dishes: [],
      });
      restaurantsList.push(restaurant);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    repository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all restaurants', async () => {
    const result = await service.findAll();
    expect(result).not.toBeNull();
    expect(result).toHaveLength(restaurantsList.length);
  });

  it('findOne should return a restaurant by id', async () => {
    const stored = restaurantsList[0];
    const restaurant = await service.findOne(stored.id);
    expect(restaurant).not.toBeNull();
    expect(restaurant.name).toEqual(stored.name);
  });

  it('findOne should throw error if restaurant not found', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Restaurant not found',
    );
  });

  it('create should return a new restaurant', async () => {
    const restaurant = {
      id: '',
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      type: RestaurantType.INTERNACIONAL,
      website:'website.com',
      dishes: [],
    };

    const result = await service.create(restaurant as RestaurantEntity);
    expect(result).not.toBeNull();

    const stored = await repository.findOne({ where: { id: result.id } });
    expect(stored).not.toBeNull();
    expect(stored.name).toEqual(restaurant.name);
  });

  it('update should modify a restaurant', async () => {
    const restaurant = restaurantsList[0];
    restaurant.name = 'Nuevo nombre';

    const result = await service.update(restaurant.id, restaurant);
    expect(result.name).toEqual('Nuevo nombre');
  });

  it('update should throw error if restaurant not found', async () => {
    const restaurant = restaurantsList[0];
    await expect(service.update('0', restaurant)).rejects.toHaveProperty(
      'message',
      'Restaurant not found',
    );
  });

  it('delete should remove a restaurant', async () => {
    const restaurant = restaurantsList[0];
    await service.remove(restaurant.id);

    const deleted = await repository.findOne({ where: { id: restaurant.id } });
    expect(deleted).toBeNull();
  });

  it('delete should throw error if restaurant not found', async () => {
    await expect(service.remove('0')).rejects.toHaveProperty(
      'message',
      'Restaurant not found',
    );
  });
});
