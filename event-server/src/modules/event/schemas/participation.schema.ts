import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Event } from './event.schema';

@Schema({ timestamps: true })
export class Participation extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Event;

  @Prop({ default: false })
  rewardClaimed: boolean;

  @Prop({ type: Number, default: 0 }) // 0: 조건 미충족, 1: 조건 충족
  conditionMet: number;
}

export const ParticipationSchema = SchemaFactory.createForClass(Participation);

