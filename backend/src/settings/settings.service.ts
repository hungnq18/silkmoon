import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async findAll() {
    return this.settingModel.find().exec();
  }

  async findByKey(key: string) {
    return this.settingModel.findOne({ key }).exec();
  }

  async upsert(key: string, updateSettingDto: UpdateSettingDto) {
    return this.settingModel.findOneAndUpdate(
      { key },
      { $set: updateSettingDto },
      { returnDocument: 'after', upsert: true }
    ).exec();
  }
}
