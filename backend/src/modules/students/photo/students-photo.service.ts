import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { StudentsRepository } from '../students.repository';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'students');

@Injectable()
export class StudentsPhotoService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  private async ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }

  async upload(studentId: string, centroId: string, file?: Express.Multer.File) {
    const estudiante = await this.studentsRepository.findById(studentId, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    if (!file) throw new BadRequestException('Debe adjuntar una imagen.');

    const extension = ALLOWED_MIME_TYPES[file.mimetype];
    if (!extension) {
      throw new BadRequestException('Formato de imagen no permitido. Use JPEG o PNG.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('La imagen supera el tamaño máximo permitido (2 MB).');
    }

    await this.ensureUploadDir();

    // Never trust the client's filename: generate our own before writing to disk.
    const filename = `${uuid()}${extension}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);

    const previousFile = estudiante.fotoArchivo;
    await this.studentsRepository.update(studentId, centroId, { fotoArchivo: filename });

    if (previousFile) {
      await fs.unlink(path.join(UPLOAD_DIR, previousFile)).catch(() => undefined);
    }

    return { fotoArchivo: filename };
  }

  async resolveFile(studentId: string, centroId: string): Promise<{ absolutePath: string; mimetype: string }> {
    const estudiante = await this.studentsRepository.findById(studentId, centroId);
    if (!estudiante || !estudiante.fotoArchivo) {
      throw new NotFoundException('Photo not found');
    }
    const extension = path.extname(estudiante.fotoArchivo).toLowerCase();
    const mimetype = extension === '.png' ? 'image/png' : 'image/jpeg';
    return { absolutePath: path.join(UPLOAD_DIR, estudiante.fotoArchivo), mimetype };
  }
}
