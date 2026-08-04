import { Injectable } from '@nestjs/common';
import { MockDataStore } from '../../common/mock-data/mock-data.store';

@Injectable()
export class SchoolsRepository {
  constructor(private readonly store: MockDataStore) {}

  findById(id: string) {
    return this.store.centros.find((c) => c.id === id);
  }
}
