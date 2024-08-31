import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './sm.service';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';
import { BadRequestException } from '@nestjs/common';

describe('ShippingService', () => {
  let service: ShippingService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: PrismaService,
          useValue: {
            shippingMethod: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return shipping methods', async () => {
    const methods = [{ id: 'methodId', name: 'Standard Shipping', cost : 123, createdAt : new Date(), updatedAt : new Date()}];
    jest.spyOn(prismaService.shippingMethod, 'findMany').mockResolvedValue(methods);

    const result = await service.getShippingMethods();

    expect(result).toEqual({
      success: true,
      message: 'Shipping methods retrieved successfully',
      data: methods,
    });
  });

  it('should estimate shipping costs', async () => {
    const estimateShippingDto: EstimateShippingDto = { weight: 10, destination: 'NY', dimensions : {length : 123, width : 123, height : 123}};
    const estimatedCost = 60; // Calculation: 10 * 5 + 10
    jest.spyOn(service as any, 'calculateShippingCost').mockReturnValue(estimatedCost);

    const result = await service.estimateShipping(estimateShippingDto);

    expect(result).toEqual({
      success: true,
      message: 'Shipping cost estimated successfully',
      data: { estimatedCost },
    });
  });

  it('should throw BadRequestException if estimation data is invalid', async () => {
    await expect(service.estimateShipping(null as any)).rejects.toThrow(BadRequestException);
  });
});

