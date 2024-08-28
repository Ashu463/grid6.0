import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ShippingService } from './sm.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';


@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('methods')
  async getShippingMethods() {
    return this.shippingService.getShippingMethods();
  }

  @Post('estimate')
  async estimateShipping(@Body() estimateShippingDto: EstimateShippingDto) {
    return this.shippingService.estimateShipping(estimateShippingDto);
  }


  
}
