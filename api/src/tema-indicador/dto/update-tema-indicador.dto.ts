import { PartialType } from '@nestjs/swagger';
import { CreateTemaIndicadorDto } from './create-tema-indicador.dto';

export class UpdateTemaIndicadorDto extends PartialType(CreateTemaIndicadorDto) {}