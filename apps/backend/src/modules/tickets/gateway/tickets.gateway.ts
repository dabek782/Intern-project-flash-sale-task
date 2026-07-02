import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TicketsGateway {
  @WebSocketServer()
  server!:Server 

  broadcastTicketUpdate(ticketId: string, newQuantity: number) {
    this.server.emit('ticket_updated', { ticketId, quantity: newQuantity });
  }
} 

//tickets-gateway.ts is file that creates channel for live update of ticket quantity