import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Si la empresa ya configuró su catálogo de departamentos (panel admin),
 * exige que `departamento` sea exactamente uno de esos valores — así se
 * evita el desajuste de texto libre entre el departamento de un talento y
 * el departamento que gestiona un Gerente. Si la empresa todavía no
 * configuró ninguno, se permite texto libre (compatibilidad con empresas
 * que ya tenían departamentos escritos a mano antes de este catálogo).
 */
export async function validarDepartamentoPermitido(
  prisma: PrismaService,
  empresaId: string,
  departamento: string | null | undefined,
): Promise<void> {
  if (!departamento) return;

  const totalDefinidos = await prisma.departamentoDefinicion.count({
    where: { empresaId },
  });
  if (totalDefinidos === 0) return;

  const existe = await prisma.departamentoDefinicion.findUnique({
    where: { empresaId_nombre: { empresaId, nombre: departamento } },
  });
  if (!existe) {
    throw new BadRequestException(
      `"${departamento}" no está en la lista de departamentos configurada para esta empresa`,
    );
  }
}
