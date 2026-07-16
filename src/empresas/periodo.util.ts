import { BadRequestException } from '@nestjs/common';

export interface RangoFechas {
  inicio: Date;
  fin: Date;
}

export function rangoMensual(valor: string): RangoFechas {
  const match = /^(\d{4})-(\d{2})$/.exec(valor);
  if (!match) {
    throw new BadRequestException(
      'valor debe tener el formato YYYY-MM para periodo mensual',
    );
  }
  const anio = Number(match[1]);
  const mes = Number(match[2]);
  if (mes < 1 || mes > 12) {
    throw new BadRequestException(
      'valor debe tener el formato YYYY-MM para periodo mensual',
    );
  }
  return {
    inicio: new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0)),
    fin: new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999)),
  };
}

export function rangoAnual(valor: string): RangoFechas {
  const match = /^(\d{4})$/.exec(valor);
  if (!match) {
    throw new BadRequestException(
      'valor debe tener el formato YYYY para periodo anual',
    );
  }
  const anio = Number(match[1]);
  return {
    inicio: new Date(Date.UTC(anio, 0, 1, 0, 0, 0, 0)),
    fin: new Date(Date.UTC(anio, 11, 31, 23, 59, 59, 999)),
  };
}

export function rangoSemanal(valor: string): RangoFechas {
  const match = /^(\d{4})-W(\d{2})$/.exec(valor);
  if (!match) {
    throw new BadRequestException(
      'valor debe tener el formato YYYY-Www para periodo semanal',
    );
  }
  const anio = Number(match[1]);
  const semana = Number(match[2]);
  if (semana < 1 || semana > 53) {
    throw new BadRequestException(
      'valor debe tener el formato YYYY-Www para periodo semanal',
    );
  }

  const jan4 = new Date(Date.UTC(anio, 0, 4));
  const diaIsoJan4 = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay();
  const lunesSemana1 = new Date(jan4);
  lunesSemana1.setUTCDate(jan4.getUTCDate() - diaIsoJan4 + 1);

  const inicio = new Date(lunesSemana1);
  inicio.setUTCDate(lunesSemana1.getUTCDate() + (semana - 1) * 7);
  inicio.setUTCHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setUTCDate(inicio.getUTCDate() + 6);
  fin.setUTCHours(23, 59, 59, 999);

  return { inicio, fin };
}
