import { prisma } from "@/lib/prisma";

export interface ChurchInformation {
  churchName: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

const CHURCH_INFO_DEFAULTS: ChurchInformation = {
  churchName: "Birhane Genet St. Mary Church",
  shortName: "BGSM Church",
  address: "P.O. Box 12345, Addis Ababa, Ethiopia",
  phone: "+251 11 123 4567",
  email: "info@bgsmmchurch.et",
  website: "https://www.bgsmmchurch.et",
};

export const settingsService = {
  async getChurchInformation(): Promise<ChurchInformation> {
    const row = await prisma.systemSetting.findUnique({ where: { key: "church_information" } });
    if (!row) return CHURCH_INFO_DEFAULTS;
    return { ...CHURCH_INFO_DEFAULTS, ...(row.value as Partial<ChurchInformation>) };
  },
};
