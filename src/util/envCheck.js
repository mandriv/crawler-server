import dotenv from 'dotenv';

export default function () {
  // load variables
  dotenv.config();

  // check integrity
  const requiredFields = [
    'PORT',
    'SALT_ROUNDS',
    'JWT_SECRET',
    'MONGO_URI',
    'MONGO_USERNAME',
    'MONGO_PASSWORD',
  ];
  let missingFieldError = false;
  requiredFields.forEach((field) => {
    if (!process.env[field]) {
      missingFieldError = true;
      console.error(`Environment variable '${field}' is missing!`);
    }
  });
  if (missingFieldError) {
    console.error('Some enviroment variables are missing. Shutting down...');
    process.exit(1);
  }
}
