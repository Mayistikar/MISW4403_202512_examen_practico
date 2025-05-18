import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishEntity } from './dish.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors';

@Injectable()
export class DishService {
  private readonly allowedCategories = [
    'entrada',
    'plato fuerte',
    'postre',
    'bebida',
  ];

  constructor(
    @InjectRepository(DishEntity)
    private readonly dishRepo: Repository<DishEntity>,
  ) {}

  async findAll(): Promise<DishEntity[]> {
    return await this.dishRepo.find();
  }

  async findOne(id: string): Promise<DishEntity> {
    const plato = await this.dishRepo.findOne({ where: { id } });
    if (!plato) {
      throw new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    return plato;
  }

  async create(plato: DishEntity): Promise<DishEntity> {
    this.validatePlato(plato);
    return await this.dishRepo.save(plato);
  }

  async update(id: string, plato: DishEntity): Promise<DishEntity> {
    const persisted = await this.dishRepo.findOne({ where: { id } });
    if (!persisted) {
      throw new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    this.validatePlato(plato);
    plato.id = id;
    return await this.dishRepo.save(plato);
  }

  async delete(id: string): Promise<void> {
    const plato = await this.dishRepo.findOne({ where: { id } });
    if (!plato) {
      throw new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      );
    }
    await this.dishRepo.remove(plato);
  }

  private validatePlato(plato: DishEntity) {
    if (plato.precio == null || plato.precio <= 0) {
      throw new BusinessLogicException(
        'El precio debe ser un número positivo',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    if (!this.allowedCategories.includes(plato.categoria)) {
      throw new BusinessLogicException(
        `Categoría inválida. Debe ser una de: ${this.allowedCategories.join(
          ', ',
        )}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
  }
}
