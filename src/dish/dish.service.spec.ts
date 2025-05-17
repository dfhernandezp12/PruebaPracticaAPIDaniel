import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishService } from './dish.service';
import { DishEntity } from './dish.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { DishCategory } from './enums/dish-category.enum';

describe('DishService', () => {
  let service: DishService;
  let dishRepository: Repository<DishEntity>;
  let restaurantRepository: Repository<RestaurantEntity>;
  let dishesList: DishEntity[] = [];

  const seedDatabase = async () => {
    await restaurantRepository.clear();
    await dishRepository.clear();

    dishesList = [];
    for (let i = 0; i < 5; i++) {
      const dish = await dishRepository.save({
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        category: DishCategory.BEBIDA,
        restaurants: [],
      });
      dishesList.push(dish);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [DishService],
    }).compile();

    service = module.get<DishService>(DishService);
    dishRepository = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all dishes', async () => {
    const dishes = await service.findAll();
    expect(dishes).not.toBeNull();
    expect(dishes).toHaveLength(dishesList.length);
  });

  it('findOne should return a dish by id', async () => {
    const storedDish = dishesList[0];
    const dish = await service.findOne(storedDish.id);
    expect(dish).not.toBeNull();
    expect(dish.name).toEqual(storedDish.name);
  });

  it('findOne should throw error if dish not found', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty('message', 'Dish not found');
  });

  it('create should return a new dish', async () => {
    const dish = {
      id: '',
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: parseFloat(faker.commerce.price()),
      category: DishCategory.ENTRADA,
      restaurants: [],
    };

    const newDish = await service.create(dish as DishEntity);
    expect(newDish).not.toBeNull();

    const stored = await dishRepository.findOne({ where: { id: newDish.id } });
    expect(stored).not.toBeNull();
    expect(stored.name).toEqual(dish.name);
  });

  it('update should modify a dish', async () => {
    const dish = dishesList[0];
    dish.name = 'Updated name';

    const updated = await service.update(dish.id, dish);
    expect(updated.name).toEqual('Updated name');
  });

  it('update should throw error if dish not found', async () => {
    await expect(service.update('0', dishesList[0])).rejects.toHaveProperty('message', 'Dish not found');
  });

  it('delete should remove a dish', async () => {
    const dish = dishesList[0];
    await service.remove(dish.id);
    const deleted = await dishRepository.findOne({ where: { id: dish.id } });
    expect(deleted).toBeNull();
  });

  it('delete should throw error if dish not found', async () => {
    await expect(service.remove('0')).rejects.toHaveProperty('message', 'Dish not found');
  });
});
