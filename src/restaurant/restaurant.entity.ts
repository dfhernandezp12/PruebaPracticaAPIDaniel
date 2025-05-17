import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { DishEntity } from '../dish/dish.entity';

@Entity()
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  type: string;

  @Column()
  website: string;

  @ManyToMany(() => DishEntity, (dish) => dish.restaurants, {
    cascade: true,
  })
  @JoinTable()
  dishes: DishEntity[];
}
