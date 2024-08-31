import { Test, TestingModule } from '@nestjs/testing';
import { ShippingController } from './sm.controller';
import { ShippingService } from './sm.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';

describe('ShippingController', () => {
  let controller: ShippingController;
  let service: ShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [
        {
          provide: ShippingService,
          useValue: {
            getShippingMethods: jest.fn(),
            estimateShipping: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShippingController>(ShippingController);
    service = module.get<ShippingService>(ShippingService);
  });

  it('should return available shipping methods', async () => {
    const methods = [{ id: 'methodId', name: 'Standard Shipping', cost : 123, createdAt : new Date(), updatedAt : new Date()}];
    jest.spyOn(service, 'getShippingMethods').mockResolvedValue({
      success: true,
      message: 'Shipping methods retrieved successfully',
      data: methods,
    });

    const result = await controller.getShippingMethods();

    expect(result).toEqual({
      success: true,
      message: 'Shipping methods retrieved successfully',
      data: methods,
    });
  });

  it('should estimate shipping costs', async () => {
    const estimateShippingDto: EstimateShippingDto = { weight: 10, destination: 'NY', dimensions : {length : 123, width : 123, height : 123}};
    const estimatedCost = 60; // Calculation: 10 * 5 + 10
    jest.spyOn(service, 'estimateShipping').mockResolvedValue({
      success: true,
      message: 'Shipping cost estimated successfully',
      data: { estimatedCost },
    });

    const result = await controller.estimateShipping(estimateShippingDto);

    expect(result).toEqual({
      success: true,
      message: 'Shipping cost estimated successfully',
      data: { estimatedCost },
    });
  });
});

