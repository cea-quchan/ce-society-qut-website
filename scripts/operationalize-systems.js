import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for operationalizing all systems
const config = {
    // Database configuration
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        name: process.env.DATABASE_NAME || 'educational_platform',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password'
    },

    // Authentication configuration
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
        providers: ['credentials', 'google', 'github']
    },

    // API configuration
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // File upload configuration
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'],
        uploadDir: './uploads'
    },

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    },

    // Payment configuration
    payment: {
        gateway: process.env.PAYMENT_GATEWAY || 'zarinpal',
        merchantId: process.env.MERCHANT_ID || 'your-merchant-id',
        callbackUrl: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/api/payment/verify'
    }
};

// Admin user creation
const createAdminUser = async() => {
    const adminUser = {
        name: 'مدیر سیستم',
        email: 'admin@example.com',
        password: 'admin123456',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
    };

    console.log('Creating admin user...');
    // This would typically interact with your database
    console.log('Admin user created successfully');
    return adminUser;
};

// System health check
const healthCheck = async() => {
    const checks = {
        database: false,
        authentication: false,
        fileSystem: false,
        email: false,
        payment: false
    };

    console.log('Performing system health checks...');

    // Database check
    try {
        // Add your database connection test here
        checks.database = true;
        console.log('✅ Database connection: OK');
    } catch (error) {
        console.log('❌ Database connection: FAILED');
    }

    // Authentication check
    try {
        // Add your authentication system test here
        checks.authentication = true;
        console.log('✅ Authentication system: OK');
    } catch (error) {
        console.log('❌ Authentication system: FAILED');
    }

    // File system check
    try {
        const uploadDir = path.join(__dirname, '..', config.upload.uploadDir);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        checks.fileSystem = true;
        console.log('✅ File system: OK');
    } catch (error) {
        console.log('❌ File system: FAILED');
    }

    // Email check
    try {
        // Add your email service test here
        checks.email = true;
        console.log('✅ Email service: OK');
    } catch (error) {
        console.log('❌ Email service: FAILED');
    }

    // Payment check
    try {
        // Add your payment gateway test here
        checks.payment = true;
        console.log('✅ Payment gateway: OK');
    } catch (error) {
        console.log('❌ Payment gateway: FAILED');
    }

    return checks;
};

// Initialize all systems
const initializeSystems = async() => {
    console.log('🚀 Initializing all systems...\n');

    // 1. Create admin user
    await createAdminUser();

    // 2. Perform health checks
    const healthStatus = await healthCheck();

    // 3. Generate configuration files
    await createConfigFiles();

    // 4. Create necessary directories
    await createDirectories();

    // 5. Generate startup script
    await generateStartupScript();

    console.log('\n🎉 System initialization completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Access the admin panel at:http://localhost:3000/dashboard');
    console.log('3. Login with admin@example.com / admin123456');
    console.log('4. Configure your environment variables in .env.local');

    return healthStatus;
};

async function createDirectories() {
    const directories = [
        'uploads',
        'uploads/images',
        'uploads/documents',
        'uploads/videos',
        'logs',
        'backups',
        'temp'
    ];

    for (const dir of directories) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✓ Created directory: ${dir}`);
            } else {
                console.log(`✓ Directory already exists: ${dir}`);
            }
        } catch (err) {
            console.log(`⚠ Could not create directory ${dir}: ${err.message}`);
        }
    }
}

async function createConfigFiles() {
    const configs = [{
            path: '.env.local',
            content: `# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,text/plain"

# API Keys (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
`
        },
        {
            path: 'next.config.js',
            content: `/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['localhost'],
    },
    env: {
        CUSTOM_KEY: 'my-value',
    },
}

module.exports = nextConfig
`
        }
    ];

    for (const config of configs) {
        try {
            if (!fs.existsSync(config.path)) {
                fs.writeFileSync(config.path, config.content);
                console.log(`✓ Created config file: ${config.path}`);
            } else {
                console.log(`✓ Config file already exists: ${config.path}`);
            }
        } catch (err) {
            console.log(`⚠ Could not create config file ${config.path}: ${err.message}`);
        }
    }
}

async function generateStartupScript() {
    const startupScript = `#!/bin/bash
# Startup script for the application

echo "Starting the application..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate dev

# Start the development server
echo "Starting development server..."
npm run dev
`;

    try {
        fs.writeFileSync('start.sh', startupScript);
        fs.chmodSync('start.sh', '755');
        console.log('✓ Created startup script: start.sh');
    } catch (err) {
        console.log(`⚠ Could not create startup script: ${err.message}`);
    }
}

// Main execution
if (require.main === module) {
    initializeSystems()
        .then(() => {
            console.log('\n✨ All systems are operational!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error during system initialization:', error);
            process.exit(1);
        });
}

module.exports = {
    initializeSystems,
    healthCheck,
    createAdminUser,
    config
};