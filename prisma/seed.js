const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 กำลังล้างข้อมูลเก่าและนำเข้าข้อมูลครบถ้วนทุก Model...');

  // 1. เคลียร์ข้อมูลเก่าทั้งหมดตามลำดับความสัมพันธ์ (Foreign Key)
  await prisma.cropPlan.deleteMany();
  await prisma.field.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.plantTimeline.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.marketRequirement.deleteMany();
  await prisma.knowledgeVideo.deleteMany();
  await prisma.user.deleteMany();

  // 2. เติมข้อมูลผู้ใช้ระบบ (User)
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@vgrass.com',
        name: 'นายสมชาย ใจดี',
        role: 'ผู้ดูแลระบบ (Admin)'
      },
      {
        email: 'agent1@vgrass.com',
        name: 'นางสาววิไล สวยงาม',
        role: 'เจ้าหน้าที่ส่งเสริมการเกษตร'
      }
    ]
  });

  // 3. เติมข้อมูลเกษตรกร (Farmer)
  const farmer1 = await prisma.farmer.create({
    data: {
      code: 'P-4701',
      name: 'นายสมศักดิ์ มีสุข',
      phone: '081-234-5678',
      district: 'อ.เมืองสกลนคร (ต.ธาตุเชิงชุม)',
      subdistrict: 'ต.ธาตุเชิงชุม',
      addressDetail: '123/4 หมู่ 2'
    }
  });

  const farmer2 = await prisma.farmer.create({
    data: {
      code: 'P-4702',
      name: 'นางวันดี ขยันยิ่ง',
      phone: '089-876-5432',
      district: 'อ.สว่างแดนดิน (ต.บงเหนือ)',
      subdistrict: 'ต.บงเหนือ',
      addressDetail: '45 หมู่ 1 ถ.นิตโย'
    }
  });

  const farmer3 = await prisma.farmer.create({
    data: {
      code: 'P-4703',
      name: 'นายบุญมี รุ่งเรือง',
      phone: '086-112-3344',
      district: 'อ.วานรนิวาส (ต.เดื่อศรีไพร)',
      subdistrict: 'ต.เดื่อศรีไพร',
      addressDetail: '88/2 หมู่ 6'
    }
  });

  const farmer4 = await prisma.farmer.create({
    data: {
      code: 'P-4704',
      name: 'นางพิมพา ภูพานทอง',
      phone: '093-554-1122',
      district: 'อ.ภูพาน (ต.โคกภู)',
      subdistrict: 'ต.โคกภู',
      addressDetail: '12 หมู่ 3'
    }
  });

  // 4. เติมข้อมูลแปลงเพาะปลูก (Field)
  const field1 = await prisma.field.create({
    data: {
      name: 'แปลงสระบัว A1 (แปลงคราม)',
      sizeRai: 2.5,
      soilType: 'ดินร่วนปนทราย',
      phValue: 6.5,
      waterSystem: 'สปริงเกอร์',
      farmerId: farmer1.id
    }
  });

  await prisma.field.create({
    data: {
      name: 'แปลงดอนขาม B2 (ผักสวนครัว)',
      sizeRai: 1.5,
      soilType: 'ดินร่วน',
      phValue: 6.8,
      waterSystem: 'น้ำหยด',
      farmerId: farmer2.id
    }
  });

  await prisma.field.create({
    data: {
      name: 'แปลงหนองหาน C1 (แปลงข้าวฮาง)',
      sizeRai: 4.0,
      soilType: 'ดินเหนียวปนร่วน',
      phValue: 6.2,
      waterSystem: 'สปริงเกอร์',
      farmerId: farmer3.id
    }
  });

  await prisma.field.create({
    data: {
      name: 'แปลงเทือกเขาภูพาน (แปลงหมากเม่า GI)',
      sizeRai: 3.5,
      soilType: 'ดินร่วนปนทราย',
      phValue: 6.0,
      waterSystem: 'สปริงเกอร์',
      farmerId: farmer4.id
    }
  });

  // 5. เติมข้อมูลพืชเศรษฐกิจ GI (Plant)
  const plant1 = await prisma.plant.create({
    data: {
      name: 'ต้นคราม',
      type: 'พืช GI สกลนคร',
      yieldPerRaiKg: 3000,
      costPerRaiBaht: 25000,
      pricePerKgBaht: 50,
      growDays: 100
    }
  });

  await prisma.plant.createMany({
    data: [
      { name: 'หมากเม่า', type: 'พืช GI สกลนคร', yieldPerRaiKg: 1500, costPerRaiBaht: 30000, pricePerKgBaht: 80, growDays: 120 },
      { name: 'ข้าวฮางหอมทอง', type: 'พืช GI สกลนคร', yieldPerRaiKg: 600, costPerRaiBaht: 12000, pricePerKgBaht: 65, growDays: 110 },
      { name: 'กุยช่ายขาว', type: 'ผักสวนครัวมูลค่าสูง', yieldPerRaiKg: 2500, costPerRaiBaht: 38000, pricePerKgBaht: 35, growDays: 90 },
      { name: 'คะน้า', type: 'ผักหมุนเวียนรอบเร็ว', yieldPerRaiKg: 2000, costPerRaiBaht: 15000, pricePerKgBaht: 20, growDays: 45 }
    ]
  });

  // 6. เติมข้อมูลขั้นตอนกระบวนการผลิต (PlantTimeline)
  await prisma.plantTimeline.createMany({
    data: [
      { stepOrder: 1, title: 'เพาะกล้าครามในแปลงกล้า', dayRange: '1-20 วัน', plantId: plant1.id },
      { stepOrder: 2, title: 'ไถพรวนยกร่องแปลง', dayRange: '21-25 วัน', plantId: plant1.id },
      { stepOrder: 3, title: 'ย้ายกล้าปลูกแถวคู่', dayRange: '26-30 วัน', plantId: plant1.id },
      { stepOrder: 4, title: 'ให้น้ำพอชุ่ม/ปุ๋ยอินทรีย์', dayRange: '31-75 วัน', plantId: plant1.id },
      { stepOrder: 5, title: 'เก็บใบครามสดช่วงเช้า', dayRange: '76-90 วัน', plantId: plant1.id },
      { stepOrder: 6, title: 'หมักเนื้อคราม/ทำน้ำคราม', dayRange: '91-100 วัน', plantId: plant1.id }
    ]
  });

  // 7. เติมข้อมูลแผนการเพาะปลูก (CropPlan)
  await prisma.cropPlan.create({
    data: {
      fieldId: field1.id,
      plantId: plant1.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-08-10'),
      roundsPerYear: 3,
      usedBlocks: 2
    }
  });

  // 8. เติมข้อมูลตลาดรับซื้อ (MarketRequirement)
  await prisma.marketRequirement.createMany({
    data: [
      { buyerName: 'กลุ่มวิสาหกิจผ้าย้อมครามสกลนคร', requiredCrop: 'ใบครามสด / เนื้อคราม GI', quantityKg: 10000, pricePerKg: 50 },
      { buyerName: 'กลุ่มแปรรูปผลิตภัณฑ์หมากเม่าภูพาน', requiredCrop: 'หมากเม่าผลสด (GI)', quantityKg: 5000, pricePerKg: 80 },
      { buyerName: 'ตลาดสดเทศบาลสกลนคร', requiredCrop: 'กุยช่ายขาว / คะน้า / ผักบุ้ง', quantityKg: 2000, pricePerKg: 35 }
    ]
  });

  // 9. เติมข้อมูลคลังความรู้ (KnowledgeVideo) - แก้ไขใช้ youtubeUrl
  await prisma.knowledgeVideo.createMany({
    data: [
      { title: 'วิธีการหมักใบครามทำเนื้อครามเปียกย้อมผ้าสกลนคร', youtubeUrl: 'https://www.youtube.com/embed/4CRHfVcEap4', category: 'พืช GI สกลนคร' },
      { title: 'วิธีการยกร่องแปลงผักให้ตรง ระบายน้ำดี มือใหม่ก็ทำได้', youtubeUrl: 'https://www.youtube.com/embed/8HBdbCTTDBY', category: 'การเตรียมแปลง' },
      { title: 'เทคนิคการดูแลต้นหมากเม่า GI ให้ติดผลดก นอกฤดูกาล', youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'พืช GI สกลนคร' }
    ]
  });

  console.log('🎉 สำเร็จ! นำเข้าข้อมูลครบถ้วนทุก Model เรียบร้อยแล้ว 100%');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });