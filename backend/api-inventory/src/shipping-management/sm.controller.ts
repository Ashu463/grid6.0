import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './sm.service';
import { EstimateShippingDto } from 'src/dto/sm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('methods')
  @ApiOperation({ summary: 'Get available shipping methods' })
  @ApiResponse({ status: 200, description: 'List of available shipping methods retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No shipping methods found' })
  async getShippingMethods() : Promise<UniversalResponseDTO> {
    return this.shippingService.getShippingMethods();
  }

  @Post('estimate')
  @ApiOperation({ summary: 'Estimate shipping costs' })
  @ApiBody({ type: EstimateShippingDto, description: 'Data for estimating shipping costs' })
  @ApiResponse({ status: 200, description: 'Shipping cost estimated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async estimateShipping(@Body() estimateShippingDto: EstimateShippingDto) : Promise<UniversalResponseDTO> {
    return this.shippingService.estimateShipping(estimateShippingDto);
  }

}
