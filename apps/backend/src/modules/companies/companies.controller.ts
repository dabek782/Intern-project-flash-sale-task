import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/auth-guard';

@Controller({
  path: 'companies',
  version: '3',
})
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  getUserIdFromRequest(req: Request & { user?: any }): string {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User id not found in token');
    }
    return userId;
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: Request & { user?: any }) {
    const userId = this.getUserIdFromRequest(req);
    return this.companiesService.create(createCompanyDto , userId);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: Request & { user?: any }
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.companiesService.update(id, updateCompanyDto , userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request & { user?: any }) {
    const userId = this.getUserIdFromRequest(req);
    return this.companiesService.remove(id, userId);
  }
}
