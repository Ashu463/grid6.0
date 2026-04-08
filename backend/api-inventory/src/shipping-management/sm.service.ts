import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  constructor(private readonly prismaService: PrismaService) {}
 
  async getShippingMethods(): Promise<UniversalResponseDTO> {
    try {
      const methods = await this.prismaService.shippingMethod.findMany();
      return { success: true, message: 'Shipping methods retrieved successfully', data: methods };
    } catch (error) {
      // A05 — log server-side, never expose raw error to client
      this.logger.error('getShippingMethods failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Could not retrieve shipping methods' });
    }
  }
 
  async estimateShipping(estimateShippingDto: EstimateShippingDto): Promise<UniversalResponseDTO> {
    if (!estimateShippingDto) {
      throw new BadRequestException({ success: false, message: 'Shipping estimation data is required' });
    }
 
    // A03 — validate weight is a safe positive number (blocks NaN / Infinity injection)
    if (
      typeof estimateShippingDto.weight !== 'number' ||
      estimateShippingDto.weight <= 0 ||
      !isFinite(estimateShippingDto.weight)
    ) {
      throw new BadRequestException({ success: false, message: 'Invalid weight value' });
    }
 
    const estimatedCost = this.calculateShippingCost(estimateShippingDto);
    return { success: true, message: 'Shipping cost estimated successfully', data: { estimatedCost } };
  }
 
  private calculateShippingCost(dto: EstimateShippingDto): number {
    return dto.weight * 5 + 10;
  }

}