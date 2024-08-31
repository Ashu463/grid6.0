import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './cam.controller';
import { CategoriesService } from './cam.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dto/cam.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create method of CategoriesService', async () => {
    const createCategoryDto: CreateCategoryDto = { name: 'New Category', description: 'A new category description' };
    await controller.create(createCategoryDto);
    expect(service.create).toHaveBeenCalledWith(createCategoryDto);
  });

  it('should call findAll method of CategoriesService', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne method of CategoriesService with correct ID', async () => {
    const id = 'categoryId';
    await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should call update method of CategoriesService with correct ID and data', async () => {
    const id = 'categoryId';
    const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category', description: 'An updated category description' };
    await controller.update(id, updateCategoryDto);
    expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
  });

  it('should call remove method of CategoriesService with correct ID', async () => {
    const id = 'categoryId';
    await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
