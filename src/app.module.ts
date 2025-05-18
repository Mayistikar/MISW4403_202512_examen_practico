import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { DishModule } from './dish/dish.module';
import { RestaurantEntity } from './restaurant/restaurant.entity';
import { DishEntity } from './dish/dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantDishController } from './restaurant/restaurant-dish.controller';


@Module({
  imports: [
    RestaurantModule,
    DishModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'restaurants',
      entities: [RestaurantEntity, DishEntity],
      dropSchema: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController, RestaurantDishController],
  providers: [AppService],
})
export class AppModule {}
