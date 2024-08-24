import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private readonly logger : Logger
  constructor(private prisma: PrismaService) {this.logger = new Logger()}

  async create(data: { name: string; description?: string }) {
    if(!data){
      throw new BadRequestException({
        success : false, 
        message : 'pls send complete data in right format'
      })
    }
    try {
      const res = await this.prisma.category.create({data})
      if(!res){
        throw new BadGatewayException({
          success : false, 
          message : 'error occured while creating a category'
        })
      }
      return {
        success : true,
        message : 'category created successfully',
        data : res
      }
    }catch(error){
      this.logger.log(error)
      throw new InternalServerErrorException({
        success : false,
        message : 'internal server error'
      })
    }
  }

  async findAll() {
    try {
      const res = await this.prisma.category.findMany()
      if(!res){
        throw new BadGatewayException({
          success : false, 
          message : 'error occured while finding categories'
        })
      }
      return {
        success : true,
        message : 'category found successfully',
        data : res
      }
    }catch(error){
      this.logger.log(error)
      throw new InternalServerErrorException({
        success : false,
        message : 'internal server error'
      })
    }
  }

  async findOne(id: number) {
    if(!id){
      throw new BadRequestException({
        success : false, 
        message : 'pls send ID along with req'
      })
    }
    try {
      const res = await this.prisma.category.findUnique({where : {id}})
      if(!res){
        throw new BadGatewayException({
          success : false, 
          message : 'error occured while finding a category'
        })
      }
      return {
        success : true,
        message : 'category found successfully',
        data : res
      }
    }catch(error){
      this.logger.log(error)
      throw new InternalServerErrorException({
        success : false,
        message : 'internal server error'
      })
    }
  }

  async update(id: number, data: { name?: string; description?: string }) {
    if(!data || !id){
      throw new BadRequestException({
        success : false, 
        message : 'pls send complete data and ID in right format with request'
      })
    }
    try {
      const res = await this.prisma.category.update({where : {id}, data})
      if(!res){
        throw new BadGatewayException({
          success : false, 
          message : 'error occured while updating a category'
        })
      }
      return {
        success : true,
        message : 'category updated successfully',
        data : res
      }
    }catch(error){
      this.logger.log(error)
      throw new InternalServerErrorException({
        success : false,
        message : 'internal server error'
      })
    }
  }

  async remove(id: number) {
    if(!id){
      throw new BadRequestException({
        success : false, 
        message : 'pls send complete data in right format'
      })
    }
    try {
      const res = await this.prisma.category.delete({where : {id}})
      if(!res){
        throw new BadGatewayException({
          success : false, 
          message : 'error occured while deleting a category'
        })
      }
      return {
        success : true,
        message : 'category deleted successfully',
        data : res
      }
    }catch(error){
      this.logger.log(error)
      throw new InternalServerErrorException({
        success : false,
        message : 'internal server error'
      })
    }
  }
}
