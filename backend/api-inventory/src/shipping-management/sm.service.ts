import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShippingMethods() {
    // Logic to retrieve available shipping methods
    const methods = await this.prismaService.shippingMethod.findMany();
    return {
      success: true,
      message: 'Shipping methods retrieved successfully',
      data: methods,
    };
  }

  async estimateShipping(estimateShippingDto: EstimateShippingDto) {
    // Logic to estimate shipping costs
    const estimatedCost = this.calculateShippingCost(estimateShippingDto);

    return {
      success: true,
      message: 'Shipping cost estimated successfully',
      data: { estimatedCost },
    };
  }

  private calculateShippingCost(estimateShippingDto: EstimateShippingDto): number {
    // Implement a mock calculation based on destination, weight, and dimensions
    return estimateShippingDto.weight * 5 + 10; // Example logic
  }

  async getShippingStatus(orderId: string) {
    // Logic to retrieve shipping status for an order
    const shippingStatus = await this.prismaService.shipping.findUnique({
      where: { id:orderId },
    });

    if (!shippingStatus) {
      throw new NotFoundException('Shipping status not found for this order');
    }

    return {
      success: true,
      message: 'Shipping status retrieved successfully',
      data: shippingStatus,
    };
  }
}
