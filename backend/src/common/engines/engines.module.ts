import { Global, Module } from '@nestjs/common';
import { AcademicEngineService } from './academic-engine.service';
import { RiskEngineService } from './risk-engine.service';

@Global()
@Module({
  providers: [AcademicEngineService, RiskEngineService],
  exports: [AcademicEngineService, RiskEngineService],
})
export class EnginesModule {}
