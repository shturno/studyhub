"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";

interface UpdateSettingsParams {
  name: string;
  pomodoroDefault: number;
  breakDefault: number;
  locale?: string;
}

export async function updateProfileSettings(
  data: UpdateSettingsParams,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Não autorizado");
    }

    const { name, pomodoroDefault, breakDefault, locale } = data;

    if (pomodoroDefault < 5 || pomodoroDefault > 120) {
      return err("O tempo de foco deve estar entre 5 e 120 minutos");
    }
    if (breakDefault < 1 || breakDefault > 60) {
      return err("O tempo de pausa deve estar entre 1 e 60 minutos");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return err("Usuário não encontrado");
    }

    const currentSettings =
      typeof user.settings === "object" && user.settings !== null
        ? user.settings
        : {};

    const updatedSettings = {
      ...currentSettings,
      pomodoroDefault,
      breakDefault,
      ...(locale && { locale }),
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim() || user.name,
        settings: updatedSettings,
      },
    });

    revalidatePath("/settings");
    return ok(undefined);
  } catch (error) {
    console.error("updateProfileSettings error:", error);
    if (error instanceof Error) {
      return err(error.message);
    }
    return err("Erro ao atualizar configurações");
  }
}
