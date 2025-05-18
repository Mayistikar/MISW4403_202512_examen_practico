import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { DishEntity } from '../dish/dish.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors';

@Injectable()
export class RestaurantService {
  private readonly allowedCuisines = [
    'Italiana',
    'Japonesa',
    'Mexicana',
    'Colombiana',
    'India',
    'Internacional',
  ];

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restauranteRepo: Repository<RestaurantEntity>,
    @InjectRepository(DishEntity)
    private readonly platoRepo: Repository<DishEntity>,
  ) {}

  async findAll(): Promise<RestaurantEntity[]> {
    return await this.restauranteRepo.find({ relations: ['dishes'] });
  }

  async findOne(id: string): Promise<RestaurantEntity> {
    const restaurante = await this.restauranteRepo.findOne({
      where: { id },
      relations: ['dishes'],
    });
    if (!restaurante) {
      throw new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    return restaurante;
  }

  async create(restaurante: RestaurantEntity): Promise<RestaurantEntity> {
    if (!this.allowedCuisines.includes(restaurante.tipoCocina)) {
      throw new BusinessLogicException(
        `Tipo de cocina inválido. Debe ser uno de: ${this.allowedCuisines.join(', ')}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return await this.restauranteRepo.save(restaurante);
  }

  async update(
    id: string,
    restaurante: RestaurantEntity,
  ): Promise<RestaurantEntity> {
    const persisted = await this.restauranteRepo.findOne({ where: { id } });
    if (!persisted) {
      throw new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    if (!this.allowedCuisines.includes(restaurante.tipoCocina)) {
      throw new BusinessLogicException(
        `Tipo de cocina inválido. Debe ser uno de: ${this.allowedCuisines.join(', ')}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
    restaurante.id = id;
    return await this.restauranteRepo.save(restaurante);
  }

  async delete(id: string): Promise<void> {
    const restaurante = await this.restauranteRepo.findOne({ where: { id } });
    if (!restaurante) {
      throw new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    await this.restauranteRepo.remove(restaurante);
  }

  async addDishToRestaurant(
    restauranteId: string,
    platoId: string,
  ): Promise<RestaurantEntity> {
    const restaurante = await this.findOne(restauranteId);
    const plato = await this.platoRepo.findOne({ where: { id: platoId } });
    if (!plato) {
      throw new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    restaurante.dishes = restaurante.dishes || [];
    restaurante.dishes.push(plato);
    return await this.restauranteRepo.save(restaurante);
  }

  async findDishesFromRestaurant(
    restauranteId: string,
  ): Promise<DishEntity[]> {
    const restaurante = await this.findOne(restauranteId);
    return restaurante.dishes;
  }

  async findDishFromRestaurant(
    restauranteId: string,
    platoId: string,
  ): Promise<DishEntity> {
    const dishes = await this.findDishesFromRestaurant(restauranteId);
    const plato = dishes.find(p => p.id === platoId);
    if (!plato) {
      throw new BusinessLogicException(
        'El plato no está asociado a este restaurante',
        BusinessError.NOT_FOUND,
      );
    }
    return plato;
  }

  async updateDishesFromRestaurant(
    restauranteId: string,
    platoIds: string[],
  ): Promise<RestaurantEntity> {
    const restaurante = await this.findOne(restauranteId);
    const nuevosdishes: DishEntity[] = [];
    for (const id of platoIds) {
      const plato = await this.platoRepo.findOne({ where: { id } });
      if (!plato) {
        throw new BusinessLogicException(
          `Plato con id ${id} no encontrado`,
          BusinessError.NOT_FOUND,
        );
      }
      nuevosdishes.push(plato);
    }
    restaurante.dishes = nuevosdishes;
    return await this.restauranteRepo.save(restaurante);
  }

  async deleteDishFromRestaurant(
    restauranteId: string,
    platoId: string,
  ): Promise<void> {
    const restaurante = await this.findOne(restauranteId);
    restaurante.dishes = restaurante.dishes.filter(p => p.id !== platoId);
    await this.restauranteRepo.save(restaurante);
  }
}
