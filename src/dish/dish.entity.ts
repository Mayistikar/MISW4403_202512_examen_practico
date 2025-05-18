/* eslint-disable prettier/prettier */
/* archivo: src/dish/dish.entity.ts */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity()
export class DishEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  categoria: string; // e.g. 'entrada', 'plato fuerte', 'postre', 'bebida'

  @ManyToMany(
    () => RestaurantEntity,
    restaurant => restaurant.dishes,
  )
  restaurants: RestaurantEntity[];
}
