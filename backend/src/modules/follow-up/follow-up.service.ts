import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpRepository } from './follow-up.repository';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto';
import { EstadoSeguimiento } from '../../common/enums';

@Injectable()
export class FollowUpService {
  constructor(private readonly followUpRepository: FollowUpRepository) {}

  findByStudent(estudianteId: string, centroId: string) {
    return this.followUpRepository.findByStudent(estudianteId, centroId);
  }

  findRecent(centroId: string, limit = 10) {
    return this.followUpRepository.findRecent(centroId, limit);
  }

  create(dto: CreateFollowUpDto, centroId: string, orientadorId: string) {
    return this.followUpRepository.create({
      ...dto,
      centroId,
      orientadorId,
      proximaCita: dto.proximaCita ?? null,
      estado: EstadoSeguimiento.ABIERTO,
    });
  }

  update(id: string, centroId: string, dto: UpdateFollowUpDto) {
    const seguimiento = this.followUpRepository.update(id, centroId, dto);
    if (!seguimiento) throw new NotFoundException('Follow-up record not found');
    return seguimiento;
  }
}
