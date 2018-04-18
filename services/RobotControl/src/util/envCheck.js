import dotenv from 'dotenv';

function envCheck() {
  // load variables
  dotenv.config();

  // check integrity
  const requiredFields = [
    'PORT',
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
  } else {
    console.log('Env config ok...'); // eslint-disable-line
  }
}

export default envCheck();
