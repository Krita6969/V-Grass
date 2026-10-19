const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // บริการไฟล์สแตติกฝั่งหน้าเว็บจากโฟลเดอร์ public

// ==================== AUTHENTICATION API ====================

// 1. API สมัครสมาชิก (ซิงก์ตรงกับ Prisma Schema: email, name, role)
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, role } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ-นามสกุล และ อีเมลให้ครบถ้วน' });
    }

    const formattedEmail = email.trim().toLowerCase();

    // ตรวจสอบว่ามี email นี้ใน DB หรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
    }

    // บันทึกลง DB ตามคอลัมน์ที่มีจริง
    const newUser = await prisma.user.create({
      data: {
        email: formattedEmail,
        name: fullname,
        role: role || 'เจ้าหน้าที่ส่งเสริมการเกษตร'
      }
    });

    return res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', user: newUser });
  } catch (error) {
    console.error('❌ Register error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน', details: error.message });
  }
});

// 2. API เข้าสู่ระบบ (ยืนยันผ่าน Email)
app.post('/api/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลสำหรับเข้าสู่ระบบ' });
    }

    const formattedEmail = email.trim().toLowerCase();
    

    // ค้นหาผู้ใช้ใน DB
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail }
    });

    if (!user) {
      return res.status(401).json({ error: 'ไม่พบข้อมูลผู้ใช้อีเมลนี้ในระบบ' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullname: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', details: error.message });
  }
});
// ดึงรายชื่อผู้ใช้งานทั้งหมดในระบบ
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});



// ==================== FARMERS API ====================

// 1. ดึงข้อมูลเกษตรกรทั้งหมด
app.get('/api/farmers', async (req, res) => {
  try {
    const farmers = await prisma.farmer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmers', details: error.message });
  }
});

// 2. บันทึกข้อมูลเกษตรกรใหม่
app.post('/api/farmers', async (req, res) => {
  try {
    const { code, name, phone, district, subdistrict, addressDetail } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน' });
    }

    const farmerCode = code || `P-${Math.floor(4700 + Math.random() * 1000)}`;
    const newFarmer = await prisma.farmer.create({
      data: {
        code: farmerCode,
        name,
        phone,
        district: district || '',
        subdistrict: subdistrict || '',
        addressDetail: addressDetail || ''
      }
    });
    res.status(201).json(newFarmer);
  } catch (error) {
    console.error('❌ Failed to create farmer:', error);
    res.status(500).json({ error: 'Failed to create farmer', details: error.message });
  }
});

// 3. ลบเกษตรกร
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.farmer.delete({ where: { id } });
    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farmer', details: error.message });
  }
});


// ==================== FIELDS (LANDS) API ====================

// 1. ดึงข้อมูลแปลงเกษตรทั้งหมด
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      include: { farmer: true },
      orderBy: { createdAt: 'desc' }
    });

    const formattedFields = fields.map(f => {
      const area = f.sizeRai !== undefined && f.sizeRai !== null ? f.sizeRai : 2.5;
      const ph = f.phValue !== undefined && f.phValue !== null ? f.phValue : 6.5;

      return {
        id: f.id,
        name: f.name || 'แปลงเกษตร',
        sizeRai: area,
        areaRai: area,
        size: area,
        soilType: f.soilType || 'ดินร่วนปนทราย',
        phValue: ph,
        soilPh: ph,
        pH: ph,
        waterSystem: f.waterSystem || 'สปริงเกอร์',
        farmerId: f.farmerId,
        farmerName: f.farmer ? f.farmer.name : 'ไม่ระบุเจ้าของ'
      };
    });

    res.json(formattedFields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. บันทึกแปลงเกษตรใหม่
app.post('/api/fields', async (req, res) => {
  try {
    const { name, farmerName, sizeRai, areaRai, soilType, phValue, soilPh, waterSystem, farmerId } = req.body;
    
    let targetFarmerId = farmerId;

    if (!targetFarmerId && farmerName) {
      let farmer = await prisma.farmer.findFirst({
        where: { name: { contains: farmerName } }
      });

      if (!farmer) {
        farmer = await prisma.farmer.create({
          data: {
            code: `P-${Math.floor(4700 + Math.random() * 1000)}`,
            name: farmerName,
            phone: '081-000-0000',
            district: 'อ.เมืองสกลนคร',
            subdistrict: 'ต.ธาตุเชิงชุม',
            addressDetail: 'ไม่ระบุ'
          }
        });
      }
      targetFarmerId = farmer.id;
    }

    if (!targetFarmerId) {
      const defaultFarmer = await prisma.farmer.findFirst();
      if (defaultFarmer) {
        targetFarmerId = defaultFarmer.id;
      } else {
        const newDefault = await prisma.farmer.create({
          data: {
            code: 'P-4701',
            name: 'นายสมศักดิ์ มีสุข',
            phone: '081-234-5678',
            district: 'อ.เมืองสกลนคร',
            subdistrict: 'ต.ธาตุเชิงชุม',
            addressDetail: '123/4'
          }
        });
        targetFarmerId = newDefault.id;
      }
    }

    const finalSize = parseFloat(sizeRai || areaRai) || 2.5;
    const finalPh = parseFloat(phValue || soilPh) || 6.5;

    const newField = await prisma.field.create({
      data: {
        name: name || 'แปลงเพาะปลูกใหม่',
        sizeRai: finalSize,
        soilType: soilType || 'ดินร่วนปนทราย',
        phValue: finalPh,
        waterSystem: waterSystem || 'สปริงเกอร์',
        farmerId: targetFarmerId
      }
    });

    res.status(201).json(newField);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create field', details: error.message });
  }
});

// 3. ลบแปลงเกษตร
app.delete('/api/fields/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.field.delete({ where: { id } });
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete field', details: error.message });
  }
});

// Fallback Route รองรับ Express v5
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});