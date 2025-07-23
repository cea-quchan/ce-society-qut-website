"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcryptjs_1.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'مدیر سیستم',
            password: adminPassword,
            role: 'ADMIN',
            points: 1000,
        },
    });
    const alikheiriPassword = await bcryptjs_1.hash('@Ahmad10313', 12);
    await prisma.user.upsert({
        where: { email: 'alikheiri10313@gmail.com' },
        update: {
            name: 'alikheiri',
            password: alikheiriPassword,
            role: 'ADMIN',
            points: 1000,
        },
        create: {
            email: 'alikheiri10313@gmail.com',
            name: 'alikheiri',
            password: alikheiriPassword,
            role: 'ADMIN',
            points: 1000,
        },
    });
    const instructorPassword = await bcryptjs_1.hash('instructor123', 12);
    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@example.com' },
        update: {},
        create: {
            email: 'instructor@example.com',
            name: 'استاد نمونه',
            password: instructorPassword,
            role: 'INSTRUCTOR',
            points: 500,
        },
    });
    const userPassword = await bcryptjs_1.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'کاربر نمونه',
            password: userPassword,
            role: 'USER',
            points: 100,
        },
    });
    await prisma.course.create({
        data: {
            title: 'برنامه‌نویسی وب',
            description: 'دوره جامع برنامه‌نویسی وب با Next.js و React',
            price: 990000,
            instructorId: instructor.id,
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-08-01'),
            capacity: 30,
            enrolled: 0
        },
    });
    await prisma.event.create({
        data: {
            title: 'هکاتون برنامه‌نویسی',
            description: 'مسابقه برنامه‌نویسی 24 ساعته',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-06-02'),
            organizerId: admin.id,
            location: 'سالن همایش‌های دانشگاه',
            capacity: 50
        },
    });
    await prisma.article.create({
        data: {
            title: 'معرفی Next.js 14',
            content: 'مقاله‌ای در مورد ویژگی‌های جدید Next.js 14',
            published: true,
            authorId: instructor.id,
        },
    });
    const chatGroup = await prisma.chatGroup.create({
        data: {
            name: 'گروه عمومی',
            description: 'گروه گفتگوی عمومی انجمن',
            members: {
                create: [
                    {
                        userId: admin.id,
                        role: 'ADMIN',
                    },
                    {
                        userId: instructor.id,
                        role: 'MEMBER',
                    },
                    {
                        userId: user.id,
                        role: 'MEMBER',
                    },
                ],
            },
        },
    });
    await prisma.chatMessage.create({
        data: {
            content: 'سلام به همه!',
            groupId: chatGroup.id,
            senderId: admin.id,
        },
    });
    await prisma.competition.create({
        data: {
            title: 'مسابقه الگوریتم',
            description: 'مسابقه برنامه‌نویسی الگوریتم',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-06-02'),
            organizerId: admin.id,
            maxParticipants: 50,
        },
    });
    console.log('Seed data created successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
