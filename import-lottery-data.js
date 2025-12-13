const XLSX = require('xlsx');
const https = require('https');

// Configuration
const EXCEL_FILE = './nc_lottery_games.xlsx';
const API_URL = 'https://lotto-pro-api-production.up.railway.app/api/super-admin/lotteries';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJic2FsdEBsb3R0b3Byby5jb20iLCJmdWxsX25hbWUiOiJic2FsdCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTc2NTU4OTIxMSwiZXhwIjoxNzY2MTk0MDExfQ.U4U4-vRMy_liyyuoKjgrv8rtGdkgkzuFpQ045IOmHpc';

// Read Excel file
console.log('Reading Excel file:', EXCEL_FILE);
const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('\n=== Excel File Preview ===');
console.log('Total rows:', data.length);
console.log('\nFirst row sample:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nColumn names:', Object.keys(data[0]));

// Function to make API request
function createLottery(lotteryData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(lotteryData);

    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: JSON.parse(responseData) });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Map Excel columns to API fields
function mapRowToLotteryData(row) {
  // Parse price - remove $ sign and convert to number
  let price = row['price'] || '0';
  if (typeof price === 'string') {
    price = price.replace(/[$,]/g, '');
  }
  price = parseFloat(price) || 0;

  // Parse start and end numbers - convert to integers
  const startNumber = parseInt(String(row['start_number'] || '0').replace(/^0+/, '') || '0');
  const endNumber = parseInt(String(row['end_number'] || '0').replace(/^0+/, '') || '0');

  return {
    lottery_name: row['lottery_name'],
    lottery_number: String(row['lottery_number']),
    state: row['state'] || 'NC',
    price: price,
    start_number: startNumber,
    end_number: endNumber,
    launch_date: row['launch_date'] || null,
    status: row['status'] || 'active',
    image_url: row['image_url'] || null
  };
}

// Main import function
async function importData() {
  console.log('\n=== Starting Import ===\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    console.log(`\nProcessing row ${i + 1}/${data.length}`);

    try {
      const lotteryData = mapRowToLotteryData(row);
      console.log('Data to send:', JSON.stringify(lotteryData, null, 2));

      const result = await createLottery(lotteryData);
      console.log('✓ Success:', result.data);
      successCount++;

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('✗ Error:', error.message);
      errorCount++;
      errors.push({ row: i + 1, error: error.message, data: row });
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Total rows: ${data.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\nFailed rows:');
    errors.forEach(e => {
      console.log(`Row ${e.row}: ${e.error}`);
    });
  }
}

// Test with first row to verify mapping
console.log('\n=== Testing Data Mapping ===');
if (data.length > 0) {
  const testRow = mapRowToLotteryData(data[0]);
  console.log('Mapped data sample:');
  console.log(JSON.stringify(testRow, null, 2));
}

console.log('\n=== IMPORTANT ===');
console.log('This script will import lottery data to the production database.');
console.log('Please review the data preview above.');
console.log('\nTo proceed with import, uncomment the line at the bottom of this script.\n');

// Uncomment the line below to start the import
importData().catch(console.error);
