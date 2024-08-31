import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShippingMethods() : Promise<UniversalResponseDTO> {
    try {
      const methods = await this.prismaService.shippingMethod.findMany();
      return {
        success: true,
        message: 'Shipping methods retrieved successfully',
        data: methods,
      };
    } catch (error) {
      throw new BadRequestException({
        success : false,
        message : 'Failed to retrieve shipping methods.'
      });
    }
  }

  async estimateShipping(estimateShippingDto: EstimateShippingDto) : Promise<UniversalResponseDTO>{
    if (!estimateShippingDto) {
      throw new BadRequestException({
        success : false,
        message : 'Invalid shipping estimation data.'
      });
    }

    const estimatedCost = this.calculateShippingCost(estimateShippingDto);

    return {
      success: true,
      message: 'Shipping cost estimated successfully',
      data: { estimatedCost },
    };
  }

  private calculateShippingCost(estimateShippingDto: EstimateShippingDto): number {
    return estimateShippingDto.weight * 5 + 10;
  }

}