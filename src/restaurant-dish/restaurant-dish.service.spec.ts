import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { RestaurantDishService } from './restaurant-dish.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { DishEntity } from '../dish/dish.entity';
import { faker } from '@faker-js/faker';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { DishCategory } from '../dish/enums/dish-category.enum';
import { RestaurantType } from '../restaurant/enums/restaurant-type.enum';

describe('RestaurantDishService', () => {
  let service: RestaurantDishService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let dishRepository: Repository<DishEntity>;
  let restaurant: RestaurantEntity;
  let dishes: DishEntity[];

  const seedDatabase = async () => {
    await restaurantRepository.clear();
    await dishRepository.clear();

    dishes = [];
    for (let i = 0; i < 3; i++) {
      const dish = await dishRepository.save({
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        category: DishCategory.BEBIDA,
        restaurants: [],
      });
      dishes.push(dish);
    }

    restaurant = await restaurantRepository.save({
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      type: RestaurantType.COLOMBIANA,
      website:"test.com",
      dishes: [...dishes],
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [RestaurantDishService],
    }).compile();

    service = module.get<RestaurantDishService>(RestaurantDishService);
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    dishRepository = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addDishToRestaurant should add a dish', async () => {
    const newDish = await dishRepository.save({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: parseFloat(faker.commerce.price()),
      category: 'MAIN_COURSE',
      restaurants: [],
    });

    const updatedRestaurant = await service.addDishToRestaurant(
      restaurant.id,
      newDish.id,
    );
    expect(updatedRestaurant.dishes).toContainEqual(
      expect.objectContaining({ id: newDish.id }),
    );
  });

  it('addDishToRestaurant should throw exception for invalid restaurant', async () => {
    const dish = dishes[0];
    await expect(
      service.addDishToRestaurant('0', dish.id),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('addDishToRestaurant should throw exception for invalid dish', async () => {
    await expect(
      service.addDishToRestaurant(restaurant.id, '0'),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('findDishesFromRestaurant should return all dishes', async () => {
    const result = await service.findDishesFromRestaurant(restaurant.id);
    expect(result).toHaveLength(dishes.length);
  });

  it('findDishesFromRestaurant should throw exception if restaurant not found', async () => {
    await expect(service.findDishesFromRestaurant('0')).rejects.toBeInstanceOf(
      BusinessLogicException,
    );
  });

  it('findDishFromRestaurant should return the correct dish', async () => {
    const dish = dishes[0];
    const result = await service.findDishFromRestaurant(restaurant.id, dish.id);
    expect(result).not.toBeNull();
    expect(result.id).toEqual(dish.id);
  });

  it('findDishFromRestaurant should throw if restaurant not found', async () => {
    await expect(
      service.findDishFromRestaurant('0', dishes[0].id),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('findDishFromRestaurant should throw if dish not associated', async () => {
    const newDish = await dishRepository.save({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: parseFloat(faker.commerce.price()),
      category: 'MAIN_COURSE',
      restaurants: [],
    });

    await expect(
      service.findDishFromRestaurant(restaurant.id, newDish.id),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('updateDishesFromRestaurant should update all dishes', async () => {
    const newDishes = [];
    for (let i = 0; i < 2; i++) {
      const dish = await dishRepository.save({
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        category: 'MAIN_COURSE',
        restaurants: [],
      });
      newDishes.push(dish);
    }

    const updatedRestaurant = await service.updateDishesFromRestaurant(
      restaurant.id,
      newDishes.map((d) => d.id),
    );
    expect(updatedRestaurant.dishes).toHaveLength(2);
    expect(updatedRestaurant.dishes.map((d) => d.id)).toEqual(
      expect.arrayContaining(newDishes.map((d) => d.id)),
    );
  });

  it('updateDishesFromRestaurant should throw if restaurant not found', async () => {
    await expect(
      service.updateDishesFromRestaurant('0', [dishes[0].id]),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('updateDishesFromRestaurant should throw if any dish not found', async () => {
    await expect(
      service.updateDishesFromRestaurant(restaurant.id, ['0']),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('deleteDishFromRestaurant should remove a dish', async () => {
    const dish = dishes[0];
    await service.deleteDishFromRestaurant(restaurant.id, dish.id);
    const updatedRestaurant = await restaurantRepository.findOne({
      where: { id: restaurant.id },
      relations: ['dishes'],
    });
    expect(
      updatedRestaurant.dishes.find((d) => d.id === dish.id),
    ).toBeUndefined();
  });

  it('deleteDishFromRestaurant should throw if restaurant not found', async () => {
    await expect(
      service.deleteDishFromRestaurant('0', dishes[0].id),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });

  it('deleteDishFromRestaurant should throw if dish not associated', async () => {
    const newDish = await dishRepository.save({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: parseFloat(faker.commerce.price()),
      category: 'MAIN_COURSE',
      restaurants: [],
    });

    await expect(
      service.deleteDishFromRestaurant(restaurant.id, newDish.id),
    ).rejects.toBeInstanceOf(BusinessLogicException);
  });
});
