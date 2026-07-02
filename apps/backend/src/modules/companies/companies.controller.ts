import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/auth-guard';
import { AuthenticatedRequest } from '../../common/authenticated-request';


@Controller({
  path: 'companies',
  version: '3',
})
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}
  
  
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @Req() req:AuthenticatedRequest) {
    console.log(req.user)
    const userId = req.user?.userId;
    console.log('Authenticated user ID:', userId);
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    return this.companiesService.create(createCompanyDto, userId);
   
  }
  @Get('email/:email')
  getUserIdByEmail(@Param('email') email:string){
    return this.companiesService.getUserIdByEmail(email)
  }
  @Get('user/:userId')
  getIdCompanyByUserId(@Param('userId') userId:string ){
    return this.companiesService.getIdCompanyByIdUser(userId)
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
    @Req() req: AuthenticatedRequest
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    return this.companiesService.update(id, updateCompanyDto , userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    return this.companiesService.remove(id, userId);
  }

}
//comapnies controllers provides endpoints for companies specifed request