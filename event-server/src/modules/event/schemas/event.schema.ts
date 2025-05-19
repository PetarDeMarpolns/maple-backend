import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Reward {
  item: string;
  quantity: string;
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: Object,
    required: true,
    default: { item: '', quantity: '' },
  })
  reward: Reward;
}

export const EventSchema = SchemaFactory.createForClass(Event);
export type EventDocument = Event & Document;