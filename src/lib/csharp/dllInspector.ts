/**
 * Browser-side .NET DLL inspector with a real PE + CLI metadata parser.
 *
 * Strategy:
 *   1. Parse PE headers → locate CLR/CLI header via DataDirectory[14].
 *   2. Resolve RVA → file offset using section table.
 *   3. Parse CLI header → metadata root (BSJB), version string, streams.
 *   4. Extract #Strings heap (null-terminated UTF-8 entries).
 *   5. Validate that:
 *        - File name = `RLKart.Module.<Name>.dll` matching the chosen module.
 *        - Assembly name = `RLKart.Module.<Name>` matching the chosen module.
 *        - Module id literal "<id>" appears in #Strings (KartModule attribute).
 *        - Each expected exported method name exists as its own entry in #Strings
 *          (NOT a substring of the whole binary).
 *        - A SemVer version literal exists and parses.
 */

export type ModuleId = "core" | "gearbox" | "brakes" | "ignition" | "battery" | "steering";

export interface InspectionResult {
  fileName: string;
  sizeBytes: number;
  sha256: string;
  isPe: boolean;
  isDotNet: boolean;
  metadataVersion?: string;
  assemblyName?: string;
  declaredModuleId?: string;
  declaredVersion?: string;
  expectedFileName: string;
  expectedAssemblyName: string;
  expectedModuleId: ModuleId;
  fileNameOk: boolean;
  assemblyNameOk: boolean;
  moduleIdOk: boolean;
  versionOk: boolean;
  expected: string[];
  found: string[];
  missing: string[];
  /** Index of each found export inside the #Strings heap (1-based occurrence). */
  foundAt: Record<string, number>;
  assemblyNameAt?: number;
  moduleIdAt?: number;
  versionAt?: number;
  contractOk: boolean;
  /** All strings recovered from #Strings heap (truncated at 4k). */
  strings: string[];
  errors: string[];
  /** Structured per-field failures for UI rendering. */
  failures: Array<{
    field: "FileName" | "AssemblyName" | "ModuleId" | "Version" | "Export";
    expected: string;
    actual: string;
    detail?: string;
  }>;
}

export const MODULE_CONTRACT: Record<
  ModuleId,
  { assembly: string; assemblyName: string; exports: string[] }
> = {
  core: {
    assembly: "RLKart.Module.Core.dll",
    assemblyName: "RLKart.Module.Core",
    exports: ["BootCore", "Heartbeat", "RegisterModule", "GetSystemState", "EmergencyStop"],
  },
  gearbox: {
    assembly: "RLKart.Module.Gearbox.dll",
    assemblyName: "RLKart.Module.Gearbox",
    exports: ["SetGear", "GetCurrentGear", "IsShiftAllowed", "GetGearTelemetry"],
  },
  brakes: {
    assembly: "RLKart.Module.Brakes.dll",
    assemblyName: "RLKart.Module.Brakes",
    exports: ["ApplyBrake", "GetDiscTemperatureC", "SetRegenLevel", "GetBrakeTelemetry"],
  },
  ignition: {
    assembly: "RLKart.Module.Ignition.dll",
    assemblyName: "RLKart.Module.Ignition",
    exports: ["InsertSafetyKey", "PressStart", "PressStop", "GetIgnitionState"],
  },
  battery: {
    assembly: "RLKart.Module.Battery.dll",
    assemblyName: "RLKart.Module.Battery",
    exports: ["GetLevelPct", "GetVoltageV", "GetTemperatureC", "GetBatteryStatus"],
  },
  steering: {
    assembly: "RLKart.Module.Steering.dll",
    assemblyName: "RLKart.Module.Steering",
    exports: ["SetSteeringAngleDeg", "GetSteeringAngleDeg"],
  },
};

const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const MODULES_LOWER = ["core", "gearbox", "brakes", "ignition", "battery", "steering"];

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Section {
  va: number;
  size: number;
  raw: number;
  rawSize: number;
}

function rvaToOffset(rva: number, sections: Section[]): number {
  for (const s of sections) {
    if (rva >= s.va && rva < s.va + Math.max(s.size, s.rawSize)) {
      return s.raw + (rva - s.va);
    }
  }
  return -1;
}

function readNullTerminatedUtf8(
  view: DataView,
  start: number,
  max: number,
): { s: string; next: number } {
  let end = start;
  while (end < start + max && view.getUint8(end) !== 0) end++;
  const bytes = new Uint8Array(view.buffer, view.byteOffset + start, end - start);
  const s = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return { s, next: end + 1 };
}

function readPaddedString(
  view: DataView,
  start: number,
  maxLen: number,
): { s: string; consumed: number } {
  // CLI metadata version string: length-prefixed up to maxLen, padded to 4-byte boundary.
  let end = start;
  while (end < start + maxLen && view.getUint8(end) !== 0) end++;
  const bytes = new Uint8Array(view.buffer, view.byteOffset + start, end - start);
  const s = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const consumed = (maxLen + 3) & ~3;
  return { s, consumed };
}

interface ParsedDotNet {
  metadataVersion: string;
  strings: string[];
}

function parseDotNet(buf: ArrayBuffer, errors: string[]): ParsedDotNet | null {
  const view = new DataView(buf);
  if (view.byteLength < 0x40 || view.getUint8(0) !== 0x4d || view.getUint8(1) !== 0x5a) {
    errors.push("não é PE (MZ ausente)");
    return null;
  }
  const peOff = view.getUint32(0x3c, true);
  if (peOff <= 0 || peOff + 24 > view.byteLength || view.getUint32(peOff, true) !== 0x00004550) {
    errors.push("assinatura PE\\0\\0 ausente");
    return null;
  }
  const numSections = view.getUint16(peOff + 6, true);
  const sizeOptHdr = view.getUint16(peOff + 20, true);
  const optStart = peOff + 24;
  const magic = view.getUint16(optStart, true);
  const isPe32Plus = magic === 0x20b;
  // DataDirectory starts at optStart + 96 (PE32) or 112 (PE32+)
  const ddStart = optStart + (isPe32Plus ? 112 : 96);
  // CLR Runtime Header is index 14
  const cliRva = view.getUint32(ddStart + 14 * 8, true);
  const cliSize = view.getUint32(ddStart + 14 * 8 + 4, true);
  if (cliRva === 0 || cliSize === 0) {
    errors.push("DataDirectory[CLR] vazio (não é assembly .NET)");
    return null;
  }
  // Section table follows the optional header
  const sectStart = optStart + sizeOptHdr;
  const sections: Section[] = [];
  for (let i = 0; i < numSections; i++) {
    const s = sectStart + i * 40;
    sections.push({
      va: view.getUint32(s + 12, true),
      size: view.getUint32(s + 8, true),
      raw: view.getUint32(s + 20, true),
      rawSize: view.getUint32(s + 16, true),
    });
  }
  const cliOff = rvaToOffset(cliRva, sections);
  if (cliOff < 0) {
    errors.push("não foi possível resolver RVA do CLI header");
    return null;
  }
  // CLI header: dword cb, word major, word minor, dword metadataRva, dword metadataSize, ...
  const metaRva = view.getUint32(cliOff + 8, true);
  const metaOff = rvaToOffset(metaRva, sections);
  if (metaOff < 0) {
    errors.push("não foi possível resolver RVA dos metadados");
    return null;
  }
  // Metadata root: dword signature 0x424A5342 ("BSJB"), word major, word minor, dword reserved, dword length, version string padded, word flags, word streams
  if (view.getUint32(metaOff, true) !== 0x424a5342) {
    errors.push("assinatura BSJB ausente");
    return null;
  }
  const verLen = view.getUint32(metaOff + 12, true);
  const { s: metadataVersion, consumed } = readPaddedString(view, metaOff + 16, verLen);
  let p = metaOff + 16 + consumed;
  p += 2; // flags
  const numStreams = view.getUint16(p, true);
  p += 2;
  let stringsOff = -1,
    stringsSize = 0;
  for (let i = 0; i < numStreams && p < view.byteLength; i++) {
    const sOffRel = view.getUint32(p, true);
    const sSize = view.getUint32(p + 4, true);
    p += 8;
    // null-terminated name padded to 4 bytes, max 32
    let nameEnd = p;
    while (nameEnd < view.byteLength && view.getUint8(nameEnd) !== 0 && nameEnd - p < 32) nameEnd++;
    const name = new TextDecoder().decode(new Uint8Array(buf, p, nameEnd - p));
    const nameLenPadded = (nameEnd - p + 1 + 3) & ~3;
    p += nameLenPadded;
    if (name === "#Strings") {
      stringsOff = metaOff + sOffRel;
      stringsSize = sSize;
    }
  }
  if (stringsOff < 0) {
    errors.push("stream #Strings não encontrada");
    return null;
  }
  // Parse #Strings heap
  const strings: string[] = [];
  let off = stringsOff + 1; // first byte is empty string
  const end = stringsOff + stringsSize;
  while (off < end && strings.length < 8000) {
    const r = readNullTerminatedUtf8(view, off, end - off);
    if (r.s.length > 0) strings.push(r.s);
    off = r.next;
    if (r.next === off - 1) break;
  }
  return { metadataVersion, strings };
}

export async function inspectDll(file: File, moduleId: ModuleId): Promise<InspectionResult> {
  const contract = MODULE_CONTRACT[moduleId];
  const buf = await file.arrayBuffer();
  const errors: string[] = [];
  const sha256 = await sha256Hex(buf);
  const isPe =
    buf.byteLength > 0x40 &&
    new Uint8Array(buf, 0, 2)[0] === 0x4d &&
    new Uint8Array(buf, 0, 2)[1] === 0x5a;
  const parsed = parseDotNet(buf, errors);
  const isDotNet = !!parsed;
  const fileNameOk = file.name === contract.assembly;

  const strings = parsed?.strings ?? [];
  const stringsSet = new Set(strings);

  // Assembly name: must equal expected literal somewhere in #Strings
  const assemblyNameOk = isDotNet && stringsSet.has(contract.assemblyName);
  // ModuleId: lowercase id literal must appear (KartModule("<id>") attribute string)
  const moduleIdOk = isDotNet && stringsSet.has(moduleId);
  // Version: at least one SemVer literal in #Strings
  const declaredVersion = strings.find((s) => SEMVER_RE.test(s));
  const versionOk = !!declaredVersion;

  // Build position map (1-based occurrence index in #Strings)
  const indexOf = new Map<string, number>();
  strings.forEach((s, i) => {
    if (!indexOf.has(s)) indexOf.set(s, i + 1);
  });

  // Exports: each expected method name must be its OWN string heap entry
  const found = contract.exports.filter((n) => stringsSet.has(n));
  const missing = contract.exports.filter((n) => !stringsSet.has(n));
  const foundAt: Record<string, number> = {};
  for (const n of found) foundAt[n] = indexOf.get(n) ?? -1;

  const assemblyNameAt = assemblyNameOk ? indexOf.get(contract.assemblyName) : undefined;
  const moduleIdAt = moduleIdOk ? indexOf.get(moduleId) : undefined;
  const versionAt = declaredVersion ? indexOf.get(declaredVersion) : undefined;

  const contractOk =
    isPe &&
    isDotNet &&
    fileNameOk &&
    assemblyNameOk &&
    moduleIdOk &&
    versionOk &&
    missing.length === 0;

  const failures: InspectionResult["failures"] = [];
  if (!fileNameOk) {
    failures.push({
      field: "FileName",
      expected: contract.assembly,
      actual: file.name,
      detail: "nome do arquivo deve casar com o slot selecionado",
    });
    errors.push(`FileName ≠ esperado (${contract.assembly}); recebido: ${file.name}`);
  }
  if (isDotNet && !assemblyNameOk) {
    const actual = strings.find((s) => /^RLKart\.Module\./.test(s)) ?? "(não encontrado)";
    failures.push({
      field: "AssemblyName",
      expected: contract.assemblyName,
      actual,
      detail: "literal ausente em #Strings",
    });
    errors.push(`AssemblyName ≠ esperado (${contract.assemblyName}); encontrado: ${actual}`);
  }
  if (isDotNet && !moduleIdOk) {
    const candidates = strings.filter((s) => MODULES_LOWER.includes(s));
    failures.push({
      field: "ModuleId",
      expected: `"${moduleId}"`,
      actual: candidates.join(", ") || "(nenhum)",
      detail: 'atributo [KartModule("<id>")] não bate',
    });
    errors.push(
      `ModuleId ≠ "${moduleId}"; literais de módulo encontrados: ${candidates.join(", ") || "nenhum"}`,
    );
  }
  if (isDotNet && !versionOk) {
    failures.push({
      field: "Version",
      expected: "SemVer X.Y.Z[-pre]",
      actual: "(nenhum literal SemVer)",
      detail: "AssemblyVersion/AssemblyInformationalVersion ausente",
    });
    errors.push("Version SemVer ausente nos metadados (esperado X.Y.Z)");
  }
  if (isDotNet && missing.length) {
    for (const m of missing)
      failures.push({
        field: "Export",
        expected: m,
        actual: "ausente",
        detail: "método não exportado no #Strings",
      });
    errors.push(`exports faltando: ${missing.join(", ")}`);
  }

  return {
    fileName: file.name,
    sizeBytes: file.size,
    sha256,
    isPe,
    isDotNet,
    metadataVersion: parsed?.metadataVersion,
    assemblyName: assemblyNameOk
      ? contract.assemblyName
      : strings.find((s) => /^RLKart\.Module\./.test(s)),
    declaredModuleId: moduleIdOk ? moduleId : undefined,
    declaredVersion,
    expectedFileName: contract.assembly,
    expectedAssemblyName: contract.assemblyName,
    expectedModuleId: moduleId,
    fileNameOk,
    assemblyNameOk,
    moduleIdOk,
    versionOk,
    expected: contract.exports,
    found,
    missing,
    foundAt,
    assemblyNameAt,
    moduleIdAt,
    versionAt,
    contractOk,
    strings: strings.slice(0, 4000),
    errors,
    failures,
  };
}
