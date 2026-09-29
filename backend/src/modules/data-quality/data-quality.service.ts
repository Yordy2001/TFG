import { Injectable } from '@nestjs/common';
import { DataQualityRepository } from './data-quality.repository';

@Injectable()
export class DataQualityService {
  constructor(private readonly repository: DataQualityRepository) {}

  findRecent(centroId: string) {
    return this.repository.findRecent(centroId);
  }
}
