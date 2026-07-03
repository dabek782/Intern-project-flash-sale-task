import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
console.log('Starting database seeding...');


  await prisma.payments.deleteMany({});
  await prisma.orderItems.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.events.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});


  const user = await prisma.user.create({
    data: {
      email: 'organizer@bookit.com',
      password: 'hashed_password_here', 
      firstName: 'John',
      lastName:'Doe'
    },
  });


  const company = await prisma.company.create({
    data: {
      id: 1,
      name: 'Tech Events Corp',
      description:'The best ticket company',
      email:user.email,
      ownerId:user.id,
      createdBy:user.id,
    
    },
    })


  const event = await prisma.events.create({
    data: {
      id: 'event_rock_concert',
      name: 'Summer Rock Festival 2026',
      description: 'The biggest outdoor music festival of the summer featuring top rock bands.',
      eventVenue:'PGE National Stadium',
      venueAddress:'al. ks. J. Poniatowskiego 1',
      location: 'Warsaw, Poland',
      startDate: new Date('2026-07-15T18:00:00Z'),
      endDate: new Date('2026-07-15T23:00:00Z'),
      status: 'ACTIVE',
      companyId:company.id
      

    },
  });

  await prisma.ticket.create({
    data: {
      id: 'ticket_vip_pass',
      title: 'VIP Pass',
      description: 'Front row access and free drinks.',
      price: 150,
      quantity: 50,
      status: 'OPEN',
      type: 'REGULAR',
      eventId: event.id,
      companyId: company.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });