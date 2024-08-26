// shipping.dto.ts
export class EstimateShippingDto {
    destination: string;
    weight: number;
    dimensions: { length: number; width: number; height: number };
  }
  
  