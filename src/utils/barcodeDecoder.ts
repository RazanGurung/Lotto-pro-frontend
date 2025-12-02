// Barcode Decoder Utility
// Extracts and parses data from lottery ticket barcodes

export interface DecodedTicket {
  raw: string;
  storeId?: string;
  lotteryId?: string;
  lotteryName?: string;
  ticketNumber?: string;
  batchNumber?: string;
  price?: number;
  serialNumber?: string;
  isValid: boolean;
  error?: string;
}

// Lottery code mapping (expand as needed)
const LOTTERY_CODES: { [key: string]: { name: string; price: number } } = {
  'L7': { name: 'Lucky 7s', price: 1 },
  'TM': { name: 'Triple Match', price: 2 },
  'GR': { name: 'Gold Rush', price: 5 },
  'DJ': { name: 'Diamond Jackpot', price: 10 },
  'CB': { name: 'Cash Blast', price: 1 },
  'MT': { name: 'Money Tree', price: 2 },
  'FC': { name: 'Fortune Cookie', price: 3 },
};

/**
 * Main decoder function - tries multiple decoding strategies
 */
export function decodeBarcode(barcodeData: string): DecodedTicket {
  const raw = barcodeData.trim();

  // Strategy 1: Hyphen-separated format (001-L7-00045-2024001)
  if (raw.includes('-')) {
    return decodeHyphenFormat(raw);
  }

  // Strategy 2: Fixed-length numeric format (12-13 digits)
  if (/^\d{12,13}$/.test(raw)) {
    return decodeNumericFormat(raw);
  }

  // Strategy 3: Mixed alphanumeric (001L700452024)
  if (/^\d{3}[A-Z0-9]{2}\d+$/.test(raw)) {
    return decodeMixedFormat(raw);
  }

  // Strategy 4: Custom pattern with prefix
  if (raw.startsWith('LT-') || raw.startsWith('SCR-')) {
    return decodePrefixFormat(raw);
  }

  // If none match, return raw data with manual parsing needed
  return {
    raw,
    isValid: false,
    error: 'Unknown barcode format. Manual verification required.',
  };
}

/**
 * Decode hyphen-separated format: 001-L7-00045-2024001
 */
function decodeHyphenFormat(data: string): DecodedTicket {
  try {
    const parts = data.split('-');

    if (parts.length < 3) {
      return { raw: data, isValid: false, error: 'Invalid format' };
    }

    const storeId = parts[0];
    const lotteryCode = parts[1];
    const ticketNumber = parts[2];
    const batchNumber = parts[3] || '';

    const lotteryInfo = LOTTERY_CODES[lotteryCode];

    return {
      raw: data,
      storeId,
      lotteryId: lotteryCode,
      lotteryName: lotteryInfo?.name || 'Unknown Lottery',
      ticketNumber,
      batchNumber,
      price: lotteryInfo?.price,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode numeric format (EAN-13): 0011234567890
 * First 3 digits: Store ID
 * Next 2 digits: Lottery type code
 * Next 5 digits: Ticket number
 * Last 3 digits: Batch/check digits
 */
function decodeNumericFormat(data: string): DecodedTicket {
  try {
    const storeId = data.substring(0, 3);
    const lotteryCodeNum = data.substring(3, 5);
    const ticketNumber = data.substring(5, 10);
    const batchNumber = data.substring(10);

    // Map numeric codes to lottery codes
    const lotteryMap: { [key: string]: string } = {
      '01': 'L7',
      '02': 'TM',
      '05': 'GR',
      '10': 'DJ',
    };

    const lotteryCode = lotteryMap[lotteryCodeNum] || lotteryCodeNum;
    const lotteryInfo = LOTTERY_CODES[lotteryCode];

    return {
      raw: data,
      storeId,
      lotteryId: lotteryCode,
      lotteryName: lotteryInfo?.name || `Lottery ${lotteryCodeNum}`,
      ticketNumber,
      batchNumber,
      price: lotteryInfo?.price,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode mixed format: 001L700452024
 */
function decodeMixedFormat(data: string): DecodedTicket {
  try {
    const storeId = data.substring(0, 3);
    const lotteryCode = data.substring(3, 5);
    const ticketNumber = data.substring(5, 10);
    const batchNumber = data.substring(10);

    const lotteryInfo = LOTTERY_CODES[lotteryCode];

    return {
      raw: data,
      storeId,
      lotteryId: lotteryCode,
      lotteryName: lotteryInfo?.name || 'Unknown Lottery',
      ticketNumber,
      batchNumber,
      price: lotteryInfo?.price,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode prefix format: LT-001-L7-00045 or SCR-12345
 */
function decodePrefixFormat(data: string): DecodedTicket {
  try {
    const parts = data.split('-');
    const prefix = parts[0];

    if (prefix === 'LT' && parts.length >= 4) {
      const storeId = parts[1];
      const lotteryCode = parts[2];
      const ticketNumber = parts[3];
      const lotteryInfo = LOTTERY_CODES[lotteryCode];

      return {
        raw: data,
        storeId,
        lotteryId: lotteryCode,
        lotteryName: lotteryInfo?.name || 'Unknown Lottery',
        ticketNumber,
        price: lotteryInfo?.price,
        isValid: true,
      };
    }

    if (prefix === 'SCR' && parts.length >= 2) {
      const serialNumber = parts[1];
      return {
        raw: data,
        serialNumber,
        ticketNumber: serialNumber,
        isValid: true,
      };
    }

    return { raw: data, isValid: false, error: 'Invalid prefix format' };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Validate decoded ticket data
 */
export function validateTicket(decoded: DecodedTicket): boolean {
  if (!decoded.isValid) return false;

  // Add additional validation logic
  if (decoded.ticketNumber && decoded.ticketNumber.length < 3) {
    return false;
  }

  return true;
}

/**
 * Format decoded data for display
 */
export function formatDecodedData(decoded: DecodedTicket): string {
  if (!decoded.isValid) {
    return `Invalid: ${decoded.error || 'Unknown error'}`;
  }

  const parts = [];

  if (decoded.lotteryName) parts.push(`Lottery: ${decoded.lotteryName}`);
  if (decoded.ticketNumber) parts.push(`Ticket #${decoded.ticketNumber}`);
  if (decoded.price) parts.push(`Price: $${decoded.price}`);
  if (decoded.storeId) parts.push(`Store: ${decoded.storeId}`);
  if (decoded.batchNumber) parts.push(`Batch: ${decoded.batchNumber}`);

  return parts.join('\n');
}

/**
 * Extract just the ticket number for quick lookup
 */
export function extractTicketNumber(barcodeData: string): string | null {
  const decoded = decodeBarcode(barcodeData);
  return decoded.ticketNumber || null;
}

/**
 * Check if barcode belongs to a specific lottery
 */
export function matchesLottery(barcodeData: string, lotteryId: string): boolean {
  const decoded = decodeBarcode(barcodeData);
  return decoded.lotteryId === lotteryId;
}
