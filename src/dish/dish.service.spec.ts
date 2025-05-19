import { Test, TestingModule } from '@nestjs/testing';
import { DishService } from './dish.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DishEntity } from './dish.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors';

describe('DishService', () => {
  let service: DishService;
  let repository: Repository<DishEntity>;

  const mockDish: DishEntity = {
    id: '1',
    nombre: 'Plato de prueba',
    precio: 100,
    categoria: 'entrada',
  } as DishEntity;

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockDish]),
    findOne: jest.fn().mockResolvedValue(mockDish),
    save: jest.fn().mockResolvedValue(mockDish),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: getRepositoryToken(DishEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
    repository = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all dishes', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockDish]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('findOne should return a dish by id', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockDish);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('findOne should throw NOT_FOUND error if dish does not exist', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findOne('2')).rejects.toThrow(
      new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('create should save and return a new dish', async () => {
    const result = await service.create(mockDish);
    expect(result).toEqual(mockDish);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(mockDish);
  });

  it('create should throw PRECONDITION_FAILED for invalid category', async () => {
    const invalidDish = { ...mockDish, categoria: 'invalid' };
    await expect(service.create(invalidDish)).rejects.toThrow(
      new BusinessLogicException(
        'Categoría inválida. Debe ser una de: entrada, plato fuerte, postre, bebida',
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('update should update and return the dish', async () => {
    const updatedDish = { ...mockDish, nombre: 'Plato actualizado' };
    const result = await service.update('1', updatedDish);
    expect(result).toEqual(mockDish);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(updatedDish);
  });

  it('update should throw NOT_FOUND if dish does not exist', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    await expect(service.update('2', mockDish)).rejects.toThrow(
      new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('delete should remove the dish', async () => {
    await service.delete('1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.remove).toHaveBeenCalledWith(mockDish);
  });

  it('delete should throw NOT_FOUND if dish does not exist', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    await expect(service.delete('2')).rejects.toThrow(
      new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });
});
