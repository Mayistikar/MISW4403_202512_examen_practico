import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantController } from './restaurant.controller';
import { RestaurantDishController } from './restaurant-dish.controller';
import { DishEntity } from '../dish/dish.entity';

@Module({
  providers: [RestaurantService],
  imports: [TypeOrmModule.forFeature([RestaurantEntity, DishEntity])],
  controllers: [RestaurantController, RestaurantDishController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
