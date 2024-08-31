import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ShippingService } from './sm.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';


@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('methods')
  async getShippingMethods() : Promise<UniversalResponseDTO> {
    return this.shippingService.getShippingMethods();
  }

  @Post('estimate')
  async estimateShipping(@Body() estimateShippingDto: EstimateShippingDto) : Promise<UniversalResponseDTO> {
    return this.shippingService.estimateShipping(estimateShippingDto);
  }  
}
