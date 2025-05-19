import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participation } from './schemas/participation.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardRequestLog } from './schemas/reward-log.schema';
import { Event, EventDocument } from './schemas/event.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Participation.name) private participationModel: Model<Participation>,
    @InjectModel(RewardRequestLog.name) private rewardLogModel: Model<RewardRequestLog>,

  ) {}

  async getAllEvents(): Promise<any[]> {
    const events = await this.eventModel.find().exec();
    const now = new Date();
    return events.map((event)=> ({
      ...event.toObject(),
      isActive: event.startDate <= now && event.endDate >= now,
    }));
}

  async participateInEvent(userId: string, eventId: string): Promise<Participation> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('이벤트가 존재하지 않습니다');

    const existing = await this.participationModel.findOne({ userId, eventId });
    if (existing) throw new BadRequestException('이미 참여한 이벤트입니다');

    return this.participationModel.create({ userId, eventId });
  }

async claimReward(userId: string, eventId: string): Promise<string> {
  const participation = await this.participationModel.findOne({ userId, eventId });
  const event = await this.eventModel.findById(eventId);

  // 1. 참여 기록 없음
  if (!participation) {
    await this.rewardLogModel.create({
      userId,
      eventId: new mongoose.Types.ObjectId(eventId),
      status: 'NOT_PARTICIPATED',
    });
    throw new NotFoundException('참여 기록이 없습니다');
  }

  // 2. 이미 수령
  if (participation.rewardClaimed) {
    await this.rewardLogModel.create({
      userId,
      eventId: new mongoose.Types.ObjectId(eventId),
      status: 'ALREADY_CLAIMED',
    });
    throw new BadRequestException('이미 보상을 수령했습니다');
  }

  // 3. 조건 미충족
  if (participation.conditionMet !== 1) {
    await this.rewardLogModel.create({
      userId,
      eventId: new mongoose.Types.ObjectId(eventId),
      status: 'CONDITION_NOT_MET',
    });
    throw new BadRequestException('이벤트 조건을 아직 충족하지 않았습니다');
  }

  // 4. 보상 수령 처리
  participation.rewardClaimed = true;
  await participation.save();

  // 5. 로그 기록 (보상 포함)
  await this.rewardLogModel.create({
    userId,
    eventId: new mongoose.Types.ObjectId(eventId),
    status: 'SUCCESS',
    reward: {
      item: event?.reward?.item ?? 'UNKNOWN',
      quantity: event?.reward?.quantity ?? '0',
    },
  });

  return '보상을 수령했습니다!';
}

  async getStatus(userId: string, eventId: string): Promise<{ participated: boolean; rewardClaimed?: boolean }> {
    const record = await this.participationModel.findOne({ userId, eventId });
    if (!record) return { participated: false };
    return { participated: true, rewardClaimed: record.rewardClaimed };
  }  

  async createEvent(dto: CreateEventDto): Promise<Event> {
    return this.eventModel.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reward: dto.reward ?? { item: '', quantity: '' },
    });
  }

  async addReward(eventId: string, dto: CreateRewardDto): Promise<string> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('이벤트가 존재하지 않습니다');

    event.reward = { item: dto.item, quantity: dto.quantity };
    await event.save();
    return '보상이 등록되었습니다';
  }

  async getMyEvents(userId: string) {
    const records = await this.participationModel.find({ userId });
    const eventIds = records.map(r => r.eventId);
    return this.eventModel.find({ _id: { $in: eventIds } });
  }

  async getParticipants(eventId: string) {
    return this.participationModel.find({ eventId });
  }

  async updateReward(eventId: string, dto: CreateRewardDto): Promise<string> {
    const updated = await this.eventModel.findByIdAndUpdate(
      eventId,
      { reward: dto },
      { new: true }
    );
    if (!updated) throw new NotFoundException('Event not found');
    return '보상이 성공적으로 갱신되었습니다.';
  }

  async getAllParticipations(): Promise<any[]> {
    return this.participationModel
      .find()
      .populate('eventId')
      .populate('userId')
      .exec();
  }

  async getAllRewardLogs(): Promise<any[]> {
    const logs = await this.rewardLogModel
      .find()
      .sort({ createdAt: -1 })
      .populate('eventId')
      .lean()
      .exec();

    return logs.map((log: any) => ({
      userId: log.userId,
      eventTitle:
        typeof log.eventId === 'object' && log.eventId?.title
          ? log.eventId.title
          : 'Unknown',
      status: log.status,
      reward: log.reward,
      requestedAt: log.createdAt,
    }));
  }
}