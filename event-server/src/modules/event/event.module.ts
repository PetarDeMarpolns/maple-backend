import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { Participation, ParticipationSchema } from './schemas/participation.schema';
import { RewardRequestLog, RewardRequestLogSchema } from './schemas/reward-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Participation.name, schema: ParticipationSchema },
      { name: RewardRequestLog.name, schema: RewardRequestLogSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}