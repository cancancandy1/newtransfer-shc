import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// แปลง string role จาก env → AdminRole enum
function parseRole(role?: string): AdminRole {
  if (role?.toLowerCase() === "admin") return AdminRole.ADMIN;
  return AdminRole.STAFF;
}

async function seedMemberTypes() {
  const memberTypes = [
    {
      name: "บริการสระว่ายน้ำ ",
      description: "บริการสระว่ายน้ำ (Swimming Pool)",
      sub_types: [
        { name: "ประเภทรายปี (บุคคลภายใน)", service_rate: 300 },
        { name: "ประเภทรายปี (ศิษย์เก่ามทส)", service_rate: 500 },
        { name: "ประเภทรายปี (บุคคลภายนอก)", service_rate: 1000 },
      ],
    },
    {
      name: "บริการห้องออกกำลังกาย",
      description: "บริการฟิตเนส (Fitness Room)",
      sub_types: [
        { name: "ประเภทรายเดือน (ศิษย์เก่ามทส)", service_rate: 500 },
        { name: "ประเภทรายเดือน (บุคคลภายนอก)", service_rate: 1000 },
        { name: "ประเภทราย 6 เดือน (ศิษย์เก่ามทส)", service_rate: 1800 },
        { name: "ประเภทราย 6 เดือน (บุคคลภายนอก)", service_rate: 3600 },
        { name: "ประเภทรายปี (ศิษย์เก่ามทส)", service_rate: 2500 },
        { name: "ประเภทรายปี (บุคคลภายนอก)", service_rate: 5000 },
      ],
    },
    {
      name: "บริการสนามเทนนิส",
      description: "บริการสนามเทนนิส (Tennis Court)",
      sub_types: [
        { name: "ประเภทรายปี (ศิษย์เก่ามทส)", service_rate: 1500 },
        { name: "ประเภทรายปี (บุคคลภายนอก)", service_rate: 3000 },
      ],
    },
    {
      name: "บริการสนามแบดมินตัน",
      description: "บริการสนามแบดมินตัน (Badminton Court)",
      sub_types: [
        { name: "ประเภทรายปี (ศิษย์เก่ามทส)", service_rate: 1500 },
        { name: "ประเภทรายปี (บุคคลภายนอก)", service_rate: 3000 },
      ],
    },
    {
      name: "Sport Summer Camp",
      description: "Sport Summer Camp",
      sub_types: [
        { name: "SportSummerCamp", service_rate: 600 },
        { name: "SportSummerCamp", service_rate: 800 },
        { name: "SportSummerCamp", service_rate: 1000 },
      ],
    },
  ];

  for (let i = 0; i < memberTypes.length; i++) {
    const { sub_types, ...mtData } = memberTypes[i];

    const mt = await prisma.memberType.upsert({
      where: { id: i + 1 },
      update: mtData,
      create: mtData,
    });

    for (let j = 0; j < sub_types.length; j++) {
      const st = sub_types[j];
      const subTypeId = i * 10 + j + 1;

      await prisma.memberSubType.upsert({
        where: { id: subTypeId },
        update: { ...st, member_type_id: mt.id },
        create: { id: subTypeId, ...st, member_type_id: mt.id },
      });
    }
  }

  console.log(`✅ Seeded ${memberTypes.length} member types`);
}

async function seedAdmins() {
  // กำหนดรายชื่อ admin สำหรับใช้งานจริง ระบบจะสร้างบัญชีเหล่านี้ตอน seed
  const admins = [
    {
      // firstname: process.env.SEED_ADMIN1_FIRSTNAME,
      // lastname: process.env.SEED_ADMIN1_LASTNAME,
      // username: process.env.SEED_ADMIN1_USERNAME,
      // password: process.env.SEED_ADMIN1_PASSWORD,
      // role: parseRole(process.env.SEED_ADMIN1_ROLE),
      firstname: "ผู้ดูแลระบบ",
      lastname: "หลัก",
      username: "admin",
      password: "shc@dmin2026", // เปลี่ยนรหัสผ่านตรงนี้ก่อนนำไปใช้งานจริง
      role: parseRole("ADMIN"),
    },
    {
      firstname: "นายณัฐภัทร",
      lastname: "อินทร์อ๋อง",
      username: "269008",
      password: "shc@dmin269008", // เปลี่ยนรหัสผ่านตรงนี้ก่อนนำไปใช้งานจริง
      role: parseRole("STAFF"),
    },
  ].filter((a) => a.username && a.password);

  for (const admin of admins) {
    // เข้ารหัสรหัสผ่าน
    const password_hash = await bcrypt.hash(admin.password!, 12);

    await prisma.admin.upsert({
      where: { username: admin.username! },
      update: {
        firstname: admin.firstname ?? "",
        lastname: admin.lastname ?? "",
        role: admin.role,
      },
      create: {
        firstname: admin.firstname ?? "",
        lastname: admin.lastname ?? "",
        username: admin.username!,
        password_hash,
        role: admin.role,
      },
    });

    console.log(`✅ Seeded admin: ${admin.username} (${admin.role})`);
  }
}

async function seedSampleUsers() {
  // ตัวอย่าง users สำหรับทดสอบ autofill
  const sampleUsers = [
    { code: "EMP001", name: "สมชาย ใจดี", tel: "081-234-5678" },
    { code: "EMP002", name: "สมหญิง รักงาน", tel: "089-876-5432" },
    { code: "EXT001", name: "บุคคลภายนอก ทดสอบ", tel: "095-111-2222" },
  ];

  for (const u of sampleUsers) {
    await prisma.user.upsert({
      where: { code: u.code },
      update: u,
      create: u,
    });
  }

  console.log(`✅ Seeded ${sampleUsers.length} sample users`);
}

async function main() {
  console.log("🌱 Seeding database...");

  await seedMemberTypes();
  await seedSampleUsers();
  await seedAdmins();

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });