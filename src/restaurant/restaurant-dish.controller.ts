import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { DishEntity } from '../dish/dish.entity';
import { RestaurantEntity } from './restaurant.entity';

@Controller('restaurants/:restaurantId/dishes')
export class RestaurantDishController {
  constructor(private readonly restaurantDishService: RestaurantService) {}

  @Post(':dishId')
  @HttpCode(HttpStatus.CREATED)
  async addDishToRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Param('dishId', new ParseUUIDPipe()) dishId: string,
  ): Promise<void> {
    await this.restaurantDishService.addDishToRestaurant(restaurantId, dishId);
  }

  @Get()
  async findDishesFromRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
  ): Promise<DishEntity[]> {
    return this.restaurantDishService.findDishesFromRestaurant(restaurantId);
  }

  @Get(':dishId')
  async findDishFromRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Param('dishId', new ParseUUIDPipe()) dishId: string,
  ): Promise<DishEntity> {
    return this.restaurantDishService.findDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }

  @Put()
  async updateDishesFromRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Body('dishIds') dishIds: string[],
  ): Promise<RestaurantEntity> {
    return this.restaurantDishService.updateDishesFromRestaurant(
      restaurantId,
      dishIds,
    );
  }

  @Delete(':dishId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDishFromRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Param('dishId', new ParseUUIDPipe()) dishId: string,
  ): Promise<void> {
    await this.restaurantDishService.deleteDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }
}
