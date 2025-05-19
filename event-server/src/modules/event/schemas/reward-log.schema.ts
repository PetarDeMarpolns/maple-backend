import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Event } from './event.schema';

@Schema({ timestamps: true })
export class RewardRequestLog extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Event;

  @Prop({ required: true, enum: ['SUCCESS', 'ALREADY_CLAIMED', 'NOT_PARTICIPATED', 'CONDITION_NOT_MET'] })
  status: string;

  @Prop()
  message?: string;

  @Prop({ type: Object }) reward?: { item: string; quantity: string };
}

export const RewardRequestLogSchema = SchemaFactory.createForClass(RewardRequestLog);
