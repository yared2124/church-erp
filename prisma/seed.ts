/**
 * Development seed script. Run with: npx prisma db seed
 *
 * This is NOT the application's data source — it exists so a fresh
 * database has realistic starting data to develop and demo against.
 * Once seeded, the UI reads exclusively from PostgreSQL via the API.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": ["*"],
  "Sebeka Gubae": ["finance.approve", "finance.view", "family-payments.manage"],
  Priest: [
    "members.view.restricted",
    "sacraments.manage",
    "certificates.request",
  ],
  Cashier: ["transactions.create", "transactions.view.own"],
  "Property Manager": ["properties.manage", "rent-payments.manage"],
  Registrar: [
    "members.manage",
    "families.manage",
    "certificates.manage",
    "bulk-import.manage",
  ],
  "Youth Coordinator": ["youth.manage", "youth.reports.view"],
  Member: ["profile.view.own", "payments.view.own"],
};

async function main() {
  console.log("Seeding roles & permissions...");
  const roleRecords: Record<string, { id: string }> = {};
  for (const [roleName, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleRecords[roleName] = role;

    for (const key of permKeys) {
      const permission = await prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: key },
      });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log("Seeding users...");
  const defaultPassword = await bcrypt.hash("ChangeMe123!", 10);

  const seedUsers = [
    {
      name: "Abba Yohannes",
      email: "abba.yohannes@stmarychurch.et",
      role: "Super Admin",
    },
    {
      name: "Mahlet Tesfaye",
      email: "mahlet.tesfaye@stmarychurch.et",
      role: "Sebeka Gubae",
    },
    {
      name: "Daniel Assefa",
      email: "daniel.assefa@stmarychurch.et",
      role: "Priest",
    },
    {
      name: "Kidus Gebre",
      email: "kidus.gebre@stmarychurch.et",
      role: "Cashier",
    },
    {
      name: "Selamawit T.",
      email: "selamawit.t@stmarychurch.et",
      role: "Property Manager",
    },
    {
      name: "Hana Michael",
      email: "hana.michael@stmarychurch.et",
      role: "Registrar",
    },
  ];

  const users: Record<string, { id: string }> = {};
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: defaultPassword,
        status: "Active",
      },
    });
    users[u.email] = user;
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: roleRecords[u.role].id },
      },
      update: {},
      create: { userId: user.id, roleId: roleRecords[u.role].id },
    });
  }

  const superAdmin = users["abba.yohannes@stmarychurch.et"];

  console.log("Seeding families & members...");
  const familyDefs = [
    {
      name: "Getenet Family",
      address: "Bole Sub City, Woreda 03, House No. 123, Addis Ababa",
      phone: "0911 345 678",
    },
    {
      name: "Tesfaye Family",
      address: "Kirkos Sub City, Woreda 08, House No. 45, Addis Ababa",
      phone: "0911 555 111",
    },
    {
      name: "Alemu Family",
      address: "Yeka Sub City, Woreda 11, House No. 78, Addis Ababa",
      phone: "0912 777 222",
    },
    {
      name: "Kebede Family",
      address: "Kirkos Sub City, Woreda 01, Addis Ababa",
      phone: "0911 999 888",
    },
  ];

  const families: { id: string; name: string }[] = [];
  for (const f of familyDefs) {
    const family = await prisma.family.create({
      data: {
        name: f.name,
        address: f.address,
        phone: f.phone,
        sebekaStatus: "Paid",
        status: "Active",
      },
    });
    families.push(family);
  }

  const memberDefs = [
    {
      familyIdx: 0,
      firstName: "Abebe",
      lastName: "Getenet",
      gender: "Male" as const,
      roleInFamily: "Head" as const,
      dob: "1975-03-12",
    },
    {
      familyIdx: 0,
      firstName: "Hana",
      lastName: "Abebe",
      gender: "Female" as const,
      roleInFamily: "Wife" as const,
      dob: "1978-06-18",
    },
    {
      familyIdx: 0,
      firstName: "Dawit",
      lastName: "Abebe",
      gender: "Male" as const,
      roleInFamily: "Son" as const,
      dob: "2005-02-25",
    },
    {
      familyIdx: 1,
      firstName: "Yonas",
      lastName: "Tesfaye",
      gender: "Male" as const,
      roleInFamily: "Head" as const,
      dob: "1969-01-05",
    },
    {
      familyIdx: 1,
      firstName: "Mekdes",
      lastName: "Yonas",
      gender: "Female" as const,
      roleInFamily: "Wife" as const,
      dob: "1972-04-22",
    },
    {
      familyIdx: 2,
      firstName: "Sosina",
      lastName: "Alemu",
      gender: "Female" as const,
      roleInFamily: "Head" as const,
      dob: "1980-12-02",
    },
    {
      familyIdx: 3,
      firstName: "Samuel",
      lastName: "Kebede",
      gender: "Male" as const,
      roleInFamily: "Head" as const,
      dob: "1973-06-30",
    },
  ];

  const members: { id: string; firstName: string; lastName: string }[] = [];
  for (const m of memberDefs) {
    const member = await prisma.member.create({
      data: {
        familyId: families[m.familyIdx].id,
        firstName: m.firstName,
        lastName: m.lastName,
        gender: m.gender,
        dateOfBirth: new Date(m.dob),
        roleInFamily: m.roleInFamily,
        status: "Active",
        confessorPriestId: users["daniel.assefa@stmarychurch.et"].id,
      },
    });
    members.push(member);
  }

  console.log("Seeding family payments...");
  for (const family of families) {
    await prisma.familyPayment.create({
      data: {
        familyId: family.id,
        year: 2026,
        expectedAmount: 6000,
        paidAmount: 6000,
        paymentDate: new Date("2026-08-31"),
        paymentMethod: "Cash",
        status: "Paid",
      },
    });
  }

  console.log("Seeding sacraments...");
  await prisma.sacrament.create({
    data: {
      type: "Baptism",
      primaryMemberId: members[2].id, // Dawit Abebe
      familyId: families[0].id,
      date: new Date("2026-08-28"),
      priestId: users["daniel.assefa@stmarychurch.et"].id,
      status: "Approved",
      registeredById: superAdmin.id,
      sponsors: { create: [{ name: "Yonas Tesfaye", relation: "Godfather" }] },
    },
  });

  console.log("Seeding finance...");
  const account = await prisma.financeAccount.create({
    data: {
      name: "Main Church Account",
      openingBalance: 250000,
      currentBalance: 400000,
    },
  });
  const sebekaCategory = await prisma.transactionCategory.create({
    data: { name: "Sebeka Gubae", type: "Income" },
  });
  const utilityCategory = await prisma.transactionCategory.create({
    data: { name: "Utility Expense", type: "Expense" },
  });
  await prisma.transaction.create({
    data: {
      accountId: account.id,
      categoryId: sebekaCategory.id,
      type: "Income",
      description: "Sebeka Gubae Payment - Getenet Family",
      amount: 8000,
      paymentMethod: "Cash",
      status: "Paid",
      createdById: users["kidus.gebre@stmarychurch.et"].id,
    },
  });
  await prisma.transaction.create({
    data: {
      accountId: account.id,
      categoryId: utilityCategory.id,
      type: "Expense",
      description: "Electricity Bill",
      amount: 3200,
      paymentMethod: "BankTransfer",
      status: "Approved",
      createdById: users["mahlet.tesfaye@stmarychurch.et"].id,
    },
  });

  console.log("Seeding properties...");
  const property = await prisma.property.create({
    data: {
      unitName: "House #8",
      type: "House",
      monthlyRent: 3000,
      status: "Occupied",
    },
  });
  const tenant = await prisma.tenant.create({
    data: { name: "Alemu Kebede", phone: "0911 345 678" },
  });
  const lease = await prisma.leaseAgreement.create({
    data: {
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      monthlyRent: 3000,
      status: "Active",
    },
  });
  await prisma.rentPayment.create({
    data: {
      leaseAgreementId: lease.id,
      amount: 3000,
      paymentDate: new Date("2026-08-31"),
      paymentMethod: "Cash",
      status: "Paid",
    },
  });

  console.log("Seeding inventory...");
  const liturgicalCategory = await prisma.inventoryCategory.create({
    data: { name: "Liturgical Items" },
  });
  await prisma.inventoryItem.create({
    data: {
      categoryId: liturgicalCategory.id,
      name: "Chalice Set",
      quantity: 12,
      unitPrice: 12000,
      location: "Main Altar",
      status: "InStock",
    },
  });

  console.log("Seeding employees...");
  await prisma.employee.create({
    data: {
      fullName: "Abel Tesfaye",
      department: "Administration",
      position: "HR Manager",
      employmentType: "FullTime",
      status: "Active",
    },
  });

  console.log("Seeding certificate requests...");
  await prisma.certificateRequest.create({
    data: {
      memberId: members[2].id,
      type: "Baptism",
      requestedById: users["daniel.assefa@stmarychurch.et"].id,
      status: "Pending",
      purpose: "School Admission",
    },
  });

  console.log("Seeding church history...");
  await prisma.historyEntry.create({
    data: {
      year: 1896,
      title: "Church Foundation",
      description:
        "St. Mary Church was founded by a group of devoted believers.",
      type: "Milestone",
    },
  });

  console.log("Seeding system settings...");
  await prisma.systemSetting.upsert({
    where: { key: "church_information" },
    update: {},
    create: {
      key: "church_information",
      value: {
        churchName: "Birhane Genet St. Mary Church",
        shortName: "BGSM Church",
        address: "P.O. Box 12345, Addis Ababa, Ethiopia",
        phone: "+251 11 123 4567",
        email: "info@bgsmmchurch.et",
      },
      updatedById: superAdmin.id,
    },
  });

  console.log("Seeding an initial audit log entry...");
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "SEED_COMPLETED",
      entity: "System",
      entityId: "seed",
      status: "Success",
      description: "Initial development seed data loaded.",
    },
  });

  console.log("Seeding reports & bulk import history...");
  await prisma.generatedReport.create({
    data: {
      name: "Monthly Income Statement - Aug 2026",
      category: "Financial",
      format: "PDF",
      status: "Completed",
      generatedById: superAdmin.id,
    },
  });
  await prisma.importJob.create({
    data: {
      type: "Members",
      status: "Completed",
      totalRecords: 245,
      successCount: 230,
      failCount: 12,
      createdById: superAdmin.id,
    },
  });

  console.log("\nSeed complete.");
  console.log("Login with any seeded user's email and password: ChangeMe123!");
  console.log("Example: abba.yohannes@stmarychurch.et / ChangeMe123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
