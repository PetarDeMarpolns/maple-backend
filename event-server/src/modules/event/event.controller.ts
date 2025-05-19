import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Body } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Put } from '@nestjs/common';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/participate')
  participateInEvent(@Param('id') eventId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.eventService.participateInEvent(userId, eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post(':id/reward-setting')
  addReward(@Param('id') eventId: string, @Body() dto: CreateRewardDto) {
    return this.eventService.addReward(eventId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('USER')
  @Post(':id/reward')
  claimReward(@Param('id') eventId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.eventService.claimReward(userId, eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  getParticipationStatus(@Param('id') eventId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.eventService.getStatus(userId, eventId);
  }
 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post()
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.createEvent(dto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('/mine')
  getMyParticipation(@Req() req: any) {
    const userId = req.user.userId;
    return this.eventService.getMyEvents(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AUDITOR')
  @Get(':id/participants')
  getEventParticipants(@Param('id') eventId: string) {
    return this.eventService.getParticipants(eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Put(':id/reward')
  updateReward(@Param('id') eventId: string, @Body() dto: CreateRewardDto) {
    return this.eventService.updateReward(eventId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'AUDITOR')
  @Get('/all/participations')
  getAllParticipations() {
    return this.eventService.getAllParticipations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AUDITOR')
  @Get('/logs/reward-requests')
  getAllRewardLogs() {
    return this.eventService.getAllRewardLogs();
  }
}