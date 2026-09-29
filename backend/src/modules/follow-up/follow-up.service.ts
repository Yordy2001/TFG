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

  async create(dto: CreateFollowUpDto, centroId: string, orientadorId: string) {
    const seguimiento = await this.followUpRepository.create({
      ...dto,
      centroId,
      orientadorId,
      proximaCita: dto.proximaCita ?? null,
      estado: EstadoSeguimiento.ABIERTO,
      situacionEconomicaFamiliar: dto.situacionEconomicaFamiliar ?? null,
      apoyoFamiliarPercibido: dto.apoyoFamiliarPercibido ?? null,
      trabajaDurantePeriodoEscolar: dto.trabajaDurantePeriodoEscolar ?? null,
      distanciaHogarEscuelaKm: dto.distanciaHogarEscuelaKm ?? null,
      problemasFamiliaresReportados: dto.problemasFamiliaresReportados ?? null,
      senalesPreviasAbandono: dto.senalesPreviasAbandono ?? null,
      factorAjusteOrientador: dto.factorAjusteOrientador ?? null,
    });
    await this.followUpRepository.appendEstadoHistorial(seguimiento.id, centroId, EstadoSeguimiento.ABIERTO, orientadorId);
    return seguimiento;
  }

  async update(id: string, centroId: string, dto: UpdateFollowUpDto, usuarioId: string) {
    const seguimiento = await this.followUpRepository.update(id, centroId, dto);
    if (!seguimiento) throw new NotFoundException('Follow-up record not found');
    if (dto.estado) {
      await this.followUpRepository.appendEstadoHistorial(seguimiento.id, centroId, dto.estado, usuarioId);
    }
    return seguimiento;
  }
}
