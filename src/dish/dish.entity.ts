import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { DishCategory } from './enums/dish-category.enum';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity()
export class DishEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  category: string;

  @ManyToMany(() => RestaurantEntity, (restaurant) => restaurant.dishes)
  restaurants: RestaurantEntity[];
}
