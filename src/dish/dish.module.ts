import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishEntity } from './dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishController } from './dish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DishEntity])],
  providers: [DishService],
  controllers: [DishController],
})
export class DishModule {}
