import { Injectable, NotFoundException } from '@nestjs/common';
import { OutcomesRepository } from './outcomes.repository';
import { CreateOutcomeDto, UpdateOutcomeDto } from './dto/outcome.dto';
import { DesenlaceEstudiante } from '../../common/interfaces/entities';

// Registers the verified final outcome of a student per academic period.
// Deliberately independent of RiskEngineService: no risk score is ever copied here.
@Injectable()
export class OutcomesService {
  constructor(private readonly outcomesRepository: OutcomesRepository) {}

  findByStudent(estudianteId: string, centroId: string) {
    return this.outcomesRepository.findByStudent(estudianteId, centroId);
  }

  create(dto: CreateOutcomeDto, centroId: string, confirmadoPorId: string) {
    return this.outcomesRepository.create({
      ...dto,
      centroId,
      confirmadoPorId,
      fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : null,
      motivoRegistradoSalida: dto.motivoRegistradoSalida ?? null,
    });
  }

  async update(id: string, centroId: string, dto: UpdateOutcomeDto) {
    const { fechaEvento, ...rest } = dto;
    const data: Partial<DesenlaceEstudiante> = {
      ...rest,
      ...(fechaEvento !== undefined ? { fechaEvento: new Date(fechaEvento) } : {}),
    };
    const desenlace = await this.outcomesRepository.update(id, centroId, data);
    if (!desenlace) throw new NotFoundException('Outcome record not found');
    return desenlace;
  }
}
