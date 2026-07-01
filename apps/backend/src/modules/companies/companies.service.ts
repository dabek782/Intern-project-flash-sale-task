import { Injectable, NotFoundException } from '@nestjs/common';
import { Company, PrismaClient } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: CreateCompanyDto , userId: string): Promise<Company> {
    return this.prisma.company.create({
      data: {
        ...data,
        createdBy: userId,
        
       
      },
    });
  }

  findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async findOne(id: number ): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async update(id: number, data: UpdateCompanyDto , userId: string): Promise<Company> {
    if (data.createdBy && data.createdBy !== userId) {
      throw new NotFoundException(`You are not authorized to update this company`);
    }
    await this.findOne(id);
    return this.prisma.company.update({
      where: { id },
      data:{
        ...data,
        updatedBy: userId,
      }
    });
  }

  async remove(id: number, userId: string): Promise<Company> {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
