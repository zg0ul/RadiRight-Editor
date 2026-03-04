export type ImagingModalityCode =
  | "US"
  | "MRI"
  | "CT"
  | "NM"
  | "PET"
  | "Angiography"
  | "Mammography"
  | "Arthrography"
  | "X-ray";

export interface ImagingModalityOption {
  /**
   * Stable identifier matching the Flutter `ImagingModality` enum name.
   * Kept for future cross‑repo tooling, not written to JSON.
   */
  id: string;
  /**
   * Short code that is written into the JSON `modality` field.
   * Must stay in sync with `ImagingModality.shortCode` in the mobile app.
   */
  code: ImagingModalityCode;
  labelEn: string;
  labelAr: string;
}

export const IMAGING_MODALITY_OPTIONS: ImagingModalityOption[] = [
  {
    id: "ultrasound",
    code: "US",
    labelEn: "Ultrasound",
    labelAr: "الموجات فوق الصوتية",
  },
  {
    id: "mri",
    code: "MRI",
    labelEn: "MRI",
    labelAr: "الرنين المغناطيسي",
  },
  {
    id: "ctScan",
    code: "CT",
    labelEn: "CT Scan",
    labelAr: "الأشعة المقطعية",
  },
  {
    id: "nuclearMedicine",
    code: "NM",
    labelEn: "Nuclear Medicine",
    labelAr: "الطب النووي",
  },
  {
    id: "petImaging",
    code: "PET",
    labelEn: "PET Imaging",
    labelAr: "التصوير المقطعي بالإصدار البوزيتروني",
  },
  {
    id: "angiography",
    code: "Angiography",
    labelEn: "Angiography",
    labelAr: "تصوير الأوعية",
  },
  {
    id: "mammography",
    code: "Mammography",
    labelEn: "Mammography",
    labelAr: "تصوير الثدي",
  },
  {
    id: "arthrography",
    code: "Arthrography",
    labelEn: "Arthrography",
    labelAr: "تصوير المفاصل",
  },
  {
    id: "xRay",
    code: "X-ray",
    labelEn: "X-ray",
    labelAr: "الأشعة السينية",
  },
] as const;

export function findImagingModalityByValue(
  value: string | null | undefined,
): ImagingModalityOption | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase().trim();

  return IMAGING_MODALITY_OPTIONS.find(
    (m) =>
      m.code.toLowerCase() === normalized ||
      m.labelEn.toLowerCase() === normalized,
  );
}

