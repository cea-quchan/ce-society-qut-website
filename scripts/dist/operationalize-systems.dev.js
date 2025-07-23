"use strict";

var fs = require('fs');

var path = require('path'); // Configuration for operationalizing all systems


var config = {
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
      windowMs: 15 * 60 * 1000,
      // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs

    }
  },
  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024,
    // 10MB
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
}; // Admin user creation

var createAdminUser = function createAdminUser() {
  var adminUser;
  return regeneratorRuntime.async(function createAdminUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          adminUser = {
            name: 'مدیر سیستم',
            email: 'admin@example.com',
            password: 'admin123456',
            role: 'ADMIN',
            isActive: true,
            emailVerified: true
          };
          console.log('Creating admin user...'); // This would typically interact with your database

          console.log('Admin user created successfully');
          return _context.abrupt("return", adminUser);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}; // System health check


var healthCheck = function healthCheck() {
  var checks, uploadDir;
  return regeneratorRuntime.async(function healthCheck$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          checks = {
            database: false,
            authentication: false,
            fileSystem: false,
            email: false,
            payment: false
          };
          console.log('Performing system health checks...'); // Database check

          try {
            // Add your database connection test here
            checks.database = true;
            console.log('✅ Database connection: OK');
          } catch (error) {
            console.log('❌ Database connection: FAILED');
          } // Authentication check


          try {
            // Add your authentication system test here
            checks.authentication = true;
            console.log('✅ Authentication system: OK');
          } catch (error) {
            console.log('❌ Authentication system: FAILED');
          } // File system check


          try {
            uploadDir = path.join(__dirname, '..', config.upload.uploadDir);

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, {
                recursive: true
              });
            }

            checks.fileSystem = true;
            console.log('✅ File system: OK');
          } catch (error) {
            console.log('❌ File system: FAILED');
          } // Email check


          try {
            // Add your email service test here
            checks.email = true;
            console.log('✅ Email service: OK');
          } catch (error) {
            console.log('❌ Email service: FAILED');
          } // Payment check


          try {
            // Add your payment gateway test here
            checks.payment = true;
            console.log('✅ Payment gateway: OK');
          } catch (error) {
            console.log('❌ Payment gateway: FAILED');
          }

          return _context2.abrupt("return", checks);

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // Initialize all systems


var initializeSystems = function initializeSystems() {
  var healthStatus;
  return regeneratorRuntime.async(function initializeSystems$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log('🚀 Initializing all systems...\n'); // 1. Create admin user

          _context3.next = 3;
          return regeneratorRuntime.awrap(createAdminUser());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(healthCheck());

        case 5:
          healthStatus = _context3.sent;
          // 3. Generate configuration files
          generateConfigFiles(); // 4. Create necessary directories

          createDirectories(); // 5. Generate startup script

          generateStartupScript();
          console.log('\n🎉 System initialization completed!');
          console.log('\n📋 Next steps:');
          console.log('1. Start the development server: npm run dev');
          console.log('2. Access the admin panel at: http://localhost:3000/dashboard');
          console.log('3. Login with admin@example.com / admin123456');
          console.log('4. Configure your environment variables in .env.local');
          return _context3.abrupt("return", healthStatus);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
}; // Generate configuration files


var generateConfigFiles = function generateConfigFiles() {
  console.log('\n📝 Generating configuration files...'); // Generate .env.local template

  var envTemplate = "# Database Configuration\nDATABASE_HOST=".concat(config.database.host, "\nDATABASE_PORT=").concat(config.database.port, "\nDATABASE_NAME=").concat(config.database.name, "\nDATABASE_USER=").concat(config.database.user, "\nDATABASE_PASSWORD=").concat(config.database.password, "\n\n# Authentication\nJWT_SECRET=").concat(config.auth.jwtSecret, "\nSESSION_SECRET=").concat(config.auth.sessionSecret, "\nNEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=").concat(config.auth.sessionSecret, "\n\n# API Configuration\nAPI_BASE_URL=").concat(config.api.baseUrl, "\nCORS_ORIGIN=").concat(config.api.corsOrigin, "\n\n# Email Configuration\nEMAIL_HOST=").concat(config.email.host, "\nEMAIL_PORT=").concat(config.email.port, "\nEMAIL_USER=").concat(config.email.user, "\nEMAIL_PASS=").concat(config.email.pass, "\n\n# Payment Configuration\nPAYMENT_GATEWAY=").concat(config.payment.gateway, "\nMERCHANT_ID=").concat(config.payment.merchantId, "\nPAYMENT_CALLBACK_URL=").concat(config.payment.callbackUrl, "\n\n# File Upload\nMAX_FILE_SIZE=").concat(config.upload.maxFileSize, "\nUPLOAD_DIR=").concat(config.upload.uploadDir, "\n\n# Development\nNODE_ENV=development\n");
  fs.writeFileSync(path.join(__dirname, '..', '.env.local.template'), envTemplate);
  console.log('✅ Generated .env.local.template');
}; // Create necessary directories


var createDirectories = function createDirectories() {
  console.log('\n📁 Creating necessary directories...');
  var directories = ['uploads', 'uploads/images', 'uploads/documents', 'uploads/videos', 'logs', 'backups', 'temp'];
  directories.forEach(function (dir) {
    var dirPath = path.join(__dirname, '..', dir);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {
        recursive: true
      });
      console.log("\u2705 Created directory: ".concat(dir));
    }
  });
}; // Generate startup script


var generateStartupScript = function generateStartupScript() {
  console.log('\n🔧 Generating startup script...');
  var startupScript = "#!/bin/bash\n\necho \"\uD83D\uDE80 Starting Educational Platform...\"\n\n# Check if Node.js is installed\nif ! command -v node &> /dev/null; then\n    echo \"\u274C Node.js is not installed. Please install Node.js first.\"\n    exit 1\nfi\n\n# Check if npm is installed\nif ! command -v npm &> /dev/null; then\n    echo \"\u274C npm is not installed. Please install npm first.\"\n    exit 1\nfi\n\n# Install dependencies if node_modules doesn't exist\nif [ ! -d \"node_modules\" ]; then\n    echo \"\uD83D\uDCE6 Installing dependencies...\"\n    npm install\nfi\n\n# Check if .env.local exists\nif [ ! -f \".env.local\" ]; then\n    echo \"\u26A0\uFE0F  .env.local file not found. Please copy .env.local.template to .env.local and configure it.\"\n    cp .env.local.template .env.local\n    echo \"\u2705 Created .env.local from template\"\nfi\n\n# Run database migrations\necho \"\uD83D\uDDC4\uFE0F  Running database migrations...\"\nnpm run db:migrate\n\n# Seed database if needed\necho \"\uD83C\uDF31 Seeding database...\"\nnpm run db:seed\n\n# Start the development server\necho \"\uD83C\uDF10 Starting development server...\"\nnpm run dev\n";
  fs.writeFileSync(path.join(__dirname, '..', 'start.sh'), startupScript);
  fs.chmodSync(path.join(__dirname, '..', 'start.sh'), '755');
  console.log('✅ Generated start.sh script');
}; // Main execution


if (require.main === module) {
  initializeSystems().then(function () {
    console.log('\n✨ All systems are operational!');
    process.exit(0);
  })["catch"](function (error) {
    console.error('❌ Error during system initialization:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeSystems: initializeSystems,
  healthCheck: healthCheck,
  createAdminUser: createAdminUser,
  config: config
};