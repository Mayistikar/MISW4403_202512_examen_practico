import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { DishEntity } from '../dish/dish.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantRepo: Repository<RestaurantEntity>;
  let dishRepo: Repository<DishEntity>;

  const mockRestaurant: RestaurantEntity = {
    id: '1',
    nombre: 'Restaurante de prueba',
    tipoCocina: 'Italiana',
    dishes: [],
    direccion: 'Calle Falsa 123',
    paginaWeb: 'http://restauranteprueba.com',
  } as RestaurantEntity;

  const mockDish: DishEntity = {
    id: '1',
    nombre: 'Plato de prueba',
    precio: 100,
    categoria: 'entrada',
  } as DishEntity;

  const mockRestaurantRepo = {
    find: jest.fn().mockResolvedValue([mockRestaurant]),
    findOne: jest.fn().mockResolvedValue(mockRestaurant),
    save: jest.fn().mockResolvedValue(mockRestaurant),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockDishRepo = {
    findOne: jest.fn().mockResolvedValue(mockDish),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useValue: mockRestaurantRepo,
        },
        {
          provide: getRepositoryToken(DishEntity),
          useValue: mockDishRepo,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantRepo = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    dishRepo = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all restaurants', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockRestaurant]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.find).toHaveBeenCalledTimes(1);
  });

  it('findOne should return a restaurant by id', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockRestaurant);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['dishes'],
    });
  });

  it('findOne should throw NOT_FOUND if restaurant does not exist', async () => {
    jest.spyOn(restaurantRepo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findOne('2')).rejects.toThrow(
      new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('create should save and return a new restaurant', async () => {
    const result = await service.create(mockRestaurant);
    expect(result).toEqual(mockRestaurant);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.save).toHaveBeenCalledWith(mockRestaurant);
  });

  it('create should throw PRECONDITION_FAILED for invalid cuisine type', async () => {
    const invalidRestaurant = { ...mockRestaurant, tipoCocina: 'Invalida' };
    await expect(service.create(invalidRestaurant)).rejects.toThrow(
      new BusinessLogicException(
        `Tipo de cocina inválido. Debe ser uno de: Italiana, Japonesa, Mexicana, Colombiana, India, Internacional`,
        BusinessError.PRECONDITION_FAILED,
      ),
    );
  });

  it('update should update and return the restaurant', async () => {
    const updatedRestaurant = {
      ...mockRestaurant,
      nombre: 'Restaurante actualizado',
    };
    const result = await service.update('1', updatedRestaurant);
    expect(result).toEqual(mockRestaurant);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.save).toHaveBeenCalledWith(updatedRestaurant);
  });

  it('update should throw NOT_FOUND if restaurant does not exist', async () => {
    jest.spyOn(restaurantRepo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.update('2', mockRestaurant)).rejects.toThrow(
      new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('delete should remove the restaurant', async () => {
    await service.delete('1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.remove).toHaveBeenCalledWith(mockRestaurant);
  });

  it('delete should throw NOT_FOUND if restaurant does not exist', async () => {
    jest.spyOn(restaurantRepo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.delete('2')).rejects.toThrow(
      new BusinessLogicException(
        'Restaurante no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('addDishToRestaurant should add a dish to a restaurant', async () => {
    const result = await service.addDishToRestaurant('1', '1');
    expect(result.dishes).toContain(mockDish);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.save).toHaveBeenCalledWith(mockRestaurant);
  });

  it('addDishToRestaurant should throw NOT_FOUND if dish does not exist', async () => {
    jest.spyOn(dishRepo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.addDishToRestaurant('1', '2')).rejects.toThrow(
      new BusinessLogicException(
        'Plato no encontrado',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('findDishesFromRestaurant should return all dishes from a restaurant', async () => {
    mockRestaurant.dishes = [mockDish];
    const result = await service.findDishesFromRestaurant('1');
    expect(result).toEqual([mockDish]);
  });

  it('findDishFromRestaurant should return a specific dish from a restaurant', async () => {
    mockRestaurant.dishes = [mockDish];
    const result = await service.findDishFromRestaurant('1', '1');
    expect(result).toEqual(mockDish);
  });

  it('findDishFromRestaurant should throw NOT_FOUND if dish is not associated', async () => {
    mockRestaurant.dishes = [];
    await expect(service.findDishFromRestaurant('1', '2')).rejects.toThrow(
      new BusinessLogicException(
        'El plato no está asociado a este restaurante',
        BusinessError.NOT_FOUND,
      ),
    );
  });

  it('updateDishesFromRestaurant should update dishes of a restaurant', async () => {
    jest.spyOn(dishRepo, 'findOne').mockResolvedValueOnce(mockDish);
    const result = await service.updateDishesFromRestaurant('1', ['1']);
    expect(result.dishes).toEqual([mockDish]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.save).toHaveBeenCalledWith(mockRestaurant);
  });

  it('deleteDishFromRestaurant should remove a dish from a restaurant', async () => {
    mockRestaurant.dishes = [mockDish];
    await service.deleteDishFromRestaurant('1', '1');
    expect(mockRestaurant.dishes).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(restaurantRepo.save).toHaveBeenCalledWith(mockRestaurant);
  });
});
