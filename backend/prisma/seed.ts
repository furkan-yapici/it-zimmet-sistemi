import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import type { DeviceStatus, DeviceType } from "../src/generated/prisma/client";

const departmentNames = ["Bilgi İşlem", "İnsan Kaynakları", "Muhasebe", "Satın Alma"];

const staffMembers = [
  { fullName: "Ali Demir", email: "ali.demir@zimmet.local", department: "Bilgi İşlem" },
  { fullName: "Ayşe Kaya", email: "ayse.kaya@zimmet.local", department: "İnsan Kaynakları" },
  { fullName: "Mehmet Çelik", email: "mehmet.celik@zimmet.local", department: "Muhasebe" },
  { fullName: "Zeynep Arslan", email: "zeynep.arslan@zimmet.local", department: "Satın Alma" },
];

interface DemoDevice {
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate?: string;
  status: DeviceStatus;
  notes?: string;
  assignedTo?: string;
}

const demoDevices: DemoDevice[] = [
  { type: "COMPUTER", brand: "Dell", model: "Latitude 5440", serialNumber: "DEMO-PC-0001", purchaseDate: "2024-03-12", warrantyEndDate: "2027-03-12", status: "IN_USE", assignedTo: "ali.demir@zimmet.local" },
  { type: "COMPUTER", brand: "Lenovo", model: "ThinkPad T14", serialNumber: "DEMO-PC-0002", purchaseDate: "2024-05-20", warrantyEndDate: "2027-05-20", status: "IN_USE", assignedTo: "ayse.kaya@zimmet.local" },
  { type: "COMPUTER", brand: "HP", model: "EliteBook 840", serialNumber: "DEMO-PC-0003", purchaseDate: "2025-01-15", warrantyEndDate: "2028-01-15", status: "IN_STOCK" },
  { type: "MONITOR", brand: "Dell", model: "P2422H", serialNumber: "DEMO-MN-0001", purchaseDate: "2024-03-12", warrantyEndDate: "2027-03-12", status: "IN_USE", assignedTo: "ali.demir@zimmet.local" },
  { type: "MONITOR", brand: "LG", model: "24MK430H", serialNumber: "DEMO-MN-0002", purchaseDate: "2023-09-01", warrantyEndDate: "2025-09-01", status: "IN_STOCK" },
  { type: "SERVER", brand: "Dell", model: "PowerEdge R450", serialNumber: "DEMO-SV-0001", purchaseDate: "2023-06-10", warrantyEndDate: "2028-06-10", status: "IN_USE", notes: "Dosya sunucusu", assignedTo: "mehmet.celik@zimmet.local" },
  { type: "PRINTER", brand: "HP", model: "LaserJet Pro M404", serialNumber: "DEMO-PR-0001", purchaseDate: "2022-11-03", status: "BROKEN", notes: "Kağıt sürme ünitesi arızalı" },
  { type: "PRINTER", brand: "Canon", model: "i-SENSYS MF445dw", serialNumber: "DEMO-PR-0002", purchaseDate: "2024-08-25", warrantyEndDate: "2026-08-25", status: "IN_STOCK" },
  { type: "COMPUTER", brand: "Apple", model: "MacBook Pro 14", serialNumber: "DEMO-PC-0004", purchaseDate: "2020-02-18", status: "RETIRED", notes: "Kullanım ömrünü doldurdu" },
  { type: "OTHER", brand: "Cisco", model: "Catalyst 2960", serialNumber: "DEMO-OT-0001", purchaseDate: "2023-01-30", warrantyEndDate: "2026-01-30", status: "IN_STOCK", notes: "Ağ anahtarı" },
];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} ortam değişkeni tanımlı değil`);
  }
  return value;
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Veritabanında zaten kullanıcı var, seed atlandı.");
    return;
  }

  const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requiredEnv("ADMIN_PASSWORD");
  const staffPassword = requiredEnv("SEED_STAFF_PASSWORD");

  const departments = new Map<string, number>();
  for (const name of departmentNames) {
    const department = await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
    departments.set(name, department.id);
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: "Sistem Yöneticisi",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      departmentId: departments.get("Bilgi İşlem")!,
    },
  });

  const staffPasswordHash = await bcrypt.hash(staffPassword, 10);
  const users = new Map<string, number>();
  for (const member of staffMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        fullName: member.fullName,
        email: member.email,
        passwordHash: staffPasswordHash,
        role: "STAFF",
        departmentId: departments.get(member.department)!,
      },
    });
    users.set(member.email, user.id);
  }

  let createdDevices = 0;
  for (const [index, item] of demoDevices.entries()) {
    const exists = await prisma.device.findUnique({ where: { serialNumber: item.serialNumber } });
    if (exists) continue;

    const device = await prisma.device.create({
      data: {
        assetTag: `DMR-${String(index + 1).padStart(5, "0")}`,
        type: item.type,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        purchaseDate: new Date(item.purchaseDate),
        warrantyEndDate: item.warrantyEndDate ? new Date(item.warrantyEndDate) : null,
        status: item.status,
        notes: item.notes ?? null,
      },
    });
    await prisma.activityLog.create({
      data: { deviceId: device.id, action: "CREATED", performedById: admin.id, details: "Cihaz sisteme eklendi" },
    });

    if (item.assignedTo) {
      await prisma.assignment.create({
        data: { deviceId: device.id, userId: users.get(item.assignedTo)!, assignedById: admin.id },
      });
      await prisma.activityLog.create({
        data: { deviceId: device.id, action: "ASSIGNED", performedById: admin.id, details: "Cihaz personele zimmetlendi" },
      });
    }
    createdDevices++;
  }

  console.log(
    `Seed tamamlandı: ${departmentNames.length} departman, ${staffMembers.length + 1} kullanıcı, ${createdDevices} yeni cihaz.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
