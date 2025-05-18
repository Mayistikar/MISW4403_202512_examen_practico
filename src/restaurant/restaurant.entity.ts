/* eslint-disable prettier/prettier */
/* archivo: src/restaurant/restaurant.entity.ts */
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
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  tipoCocina: string;

  @Column()
  paginaWeb: string;

  @ManyToMany(
    () => DishEntity,
    dish => dish.restaurants,
  )
  @JoinTable({
    name: 'restaurant_dish',
    joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'dish_id', referencedColumnName: 'id' },
  })
  dishes: DishEntity[];
}
