import { BadRequestException, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { StudentsRepository } from '../students.repository';
import { CoursesRepository } from '../../courses/courses.repository';
import { Sexo } from '../../../common/enums';
import {
  ImportConfirmSummary,
  ImportReport,
  ImportRowResult,
  IMPORT_REQUIRED_HEADERS,
} from './students-import.types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_EDAD_ESPERADA = 5;
const MAX_EDAD_ESPERADA = 25;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class StudentsImportService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly coursesRepository: CoursesRepository,
  ) {}

  async buildTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estudiantes');
    sheet.columns = IMPORT_REQUIRED_HEADERS.map((header) => ({ header, key: header, width: 22 }));
    sheet.getRow(1).font = { bold: true };
    sheet.addRow(['MAT-2001', 'Ana', 'Ramírez Peña', 'F', '2013-04-12', '3ro A']);
    sheet.addRow(['MAT-2002', 'Luis', 'Fernández Cruz', 'M', '2012-09-30', '4to B']);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async preview(file: Express.Multer.File, centroId: string): Promise<ImportReport> {
    const rows = await this.parseAndValidate(file, centroId);
    return this.summarize(rows);
  }

  async confirm(file: Express.Multer.File, centroId: string): Promise<ImportConfirmSummary> {
    const rows = await this.parseAndValidate(file, centroId);
    const importables = rows.filter((r) => r.estado !== 'error');

    let importados = 0;
    for (const row of importables) {
      if (this.studentsRepository.findByMatricula(row.matricula)) {
        row.estado = 'error';
        row.errores.push('La matrícula ya existe en el sistema.');
        continue;
      }
      this.studentsRepository.create({
        centroId,
        cursoId: row.cursoId!,
        matricula: row.matricula,
        nombres: row.nombres,
        apellidos: row.apellidos,
        sexo: row.sexo as Sexo,
        fechaNacimiento: row.fechaNacimiento,
        activo: true,
        incidentesDisciplinarios: 0,
      });
      importados += 1;
    }

    return {
      total: rows.length,
      importados,
      rechazados: rows.length - importados,
      detalle: rows,
    };
  }

  private async parseAndValidate(file: Express.Multer.File, centroId: string): Promise<ImportRowResult[]> {
    if (!file) throw new BadRequestException('Debe adjuntar un archivo.');
    if (!file.originalname?.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('El archivo debe tener extensión .xlsx.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('El archivo supera el tamaño máximo permitido (5 MB).');
    }

    const workbook = new ExcelJS.Workbook();
    try {
      // exceljs's Buffer type doesn't line up with the current @types/node Buffer generic; safe to cast.
      await workbook.xlsx.load(file.buffer as unknown as ExcelJS.Buffer);
    } catch {
      throw new BadRequestException('No se pudo leer el archivo. Verifique que sea un .xlsx válido.');
    }

    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('El archivo no contiene ninguna hoja de cálculo.');

    const headerRow = sheet.getRow(1);
    const columnIndexByHeader = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const text = String(cell.value ?? '').trim();
      if (text) columnIndexByHeader.set(text.toLowerCase(), colNumber);
    });

    const missing = IMPORT_REQUIRED_HEADERS.filter(
      (header) => !columnIndexByHeader.has(header.toLowerCase()),
    );
    if (missing.length > 0) {
      throw new BadRequestException(`Faltan columnas obligatorias en el archivo: ${missing.join(', ')}.`);
    }

    const cursos = this.coursesRepository.findAll(centroId);
    const cursosPorNombre = new Map(cursos.map((c) => [c.nombre.trim().toLowerCase(), c]));

    const cellText = (row: ExcelJS.Row, header: string): string => {
      const colNumber = columnIndexByHeader.get(header.toLowerCase())!;
      const value = row.getCell(colNumber).value;
      if (value == null) return '';
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (typeof value === 'object' && 'text' in (value as { text?: unknown })) {
        return String((value as { text: unknown }).text ?? '').trim();
      }
      return String(value).trim();
    };

    const results: ImportRowResult[] = [];
    const matriculasVistas = new Map<string, number>();

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const isRowEmpty = row.values ? (row.values as unknown[]).every((v) => v == null || v === '') : true;
      if (isRowEmpty) return;

      const matricula = cellText(row, 'Matrícula');
      const nombres = cellText(row, 'Nombres');
      const apellidos = cellText(row, 'Apellidos');
      const sexoRaw = cellText(row, 'Sexo').toUpperCase();
      const fechaNacimiento = cellText(row, 'Fecha de nacimiento');
      const cursoNombre = cellText(row, 'Curso');

      const errores: string[] = [];
      const advertencias: string[] = [];

      if (!matricula) errores.push('La matrícula es obligatoria.');
      if (!nombres) errores.push('Los nombres son obligatorios.');
      if (!apellidos) errores.push('Los apellidos son obligatorios.');

      if (!sexoRaw) {
        errores.push('El sexo es obligatorio.');
      } else if (sexoRaw !== Sexo.M && sexoRaw !== Sexo.F) {
        errores.push(`Sexo inválido ("${sexoRaw}"). Use "M" o "F".`);
      }

      let fechaValida = false;
      if (!fechaNacimiento) {
        errores.push('La fecha de nacimiento es obligatoria.');
      } else if (!DATE_PATTERN.test(fechaNacimiento) || Number.isNaN(Date.parse(fechaNacimiento))) {
        errores.push(`Fecha de nacimiento inválida ("${fechaNacimiento}"). Use el formato AAAA-MM-DD.`);
      } else {
        fechaValida = true;
        const edad = this.calcularEdad(fechaNacimiento);
        if (edad < MIN_EDAD_ESPERADA || edad > MAX_EDAD_ESPERADA) {
          advertencias.push(`Edad fuera del rango esperado (${MIN_EDAD_ESPERADA}-${MAX_EDAD_ESPERADA} años): ${edad} años.`);
        }
      }

      let cursoId: string | null = null;
      if (!cursoNombre) {
        errores.push('El curso es obligatorio.');
      } else {
        const curso = cursosPorNombre.get(cursoNombre.trim().toLowerCase());
        if (!curso) {
          errores.push(`El curso "${cursoNombre}" no existe en el centro educativo.`);
        } else {
          cursoId = curso.id;
        }
      }

      if (matricula) {
        const filaPrevia = matriculasVistas.get(matricula.toLowerCase());
        if (filaPrevia) {
          errores.push(`Matrícula duplicada en el archivo (ya aparece en la fila ${filaPrevia}).`);
        } else {
          matriculasVistas.set(matricula.toLowerCase(), rowNumber);
          if (this.studentsRepository.findByMatricula(matricula)) {
            errores.push('La matrícula ya existe en el sistema.');
          }
        }
      }

      results.push({
        fila: rowNumber,
        matricula,
        nombres,
        apellidos,
        sexo: sexoRaw,
        fechaNacimiento,
        cursoNombre,
        cursoId,
        estado: errores.length > 0 ? 'error' : advertencias.length > 0 ? 'advertencia' : 'valida',
        errores,
        advertencias,
      });
    });

    if (results.length === 0) {
      throw new BadRequestException('El archivo no contiene filas de datos.');
    }

    return results;
  }

  private calcularEdad(fechaISO: string): number {
    const nacimiento = new Date(fechaISO);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleEsteAño = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    if (hoy < cumpleEsteAño) edad -= 1;
    return edad;
  }

  private summarize(rows: ImportRowResult[]): ImportReport {
    return {
      totalFilas: rows.length,
      validas: rows.filter((r) => r.estado === 'valida').length,
      conAdvertencias: rows.filter((r) => r.estado === 'advertencia').length,
      invalidas: rows.filter((r) => r.estado === 'error').length,
      filas: rows,
    };
  }
}
