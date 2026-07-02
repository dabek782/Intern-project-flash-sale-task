import { Injectable, NotFoundException } from '@nestjs/common';
import { Company, PrismaClient , User } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: CreateCompanyDto , userId: string): Promise<Company> {
    const companyData = data
    return this.prisma.company.create({
    data: {
       name: companyData.name,
       email: companyData.email,
       description: companyData.description,
       createdBy:userId,
       user: {
        connect: { 
          id: userId 
        }
      }
  }
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
async getIdCompanyByIdUser(userId: string): Promise<number> {
  const company = await this.prisma.company.findFirst({
    where: {
      createdBy: userId,
    },

    select: {
      id: true,
    },
  });
  console.log('Company found for userId:', userId, company);
  if (!company) {
    throw new NotFoundException(`Company with userId ${userId} not found`);
  }
  console.log(userId , company.id)
  return company.id;
}
async getUserIdByEmail(email: string): Promise<{ userId: string }> {
  const company = await this.prisma.company.findFirst({
    where: {
      email: email
    }
  });

  if (!company) {
    throw new NotFoundException(`Did not find company with this email`);
  }

  return { userId: company.ownerId };
}
    
}
//comapnies services allows for creating company as well as finding company by userId or email