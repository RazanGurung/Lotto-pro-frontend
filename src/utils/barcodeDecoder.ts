// Barcode Decoder Utility
// Extracts and parses data from lottery ticket barcodes

export interface DecodedTicket {
  raw: string;
  gameNumber?: string;
  lotteryName?: string;
  ticketNumber?: string;
  packNumber?: string;
  price?: number;
  serialNumber?: string;
  isValid: boolean;
  error?: string;
}

// Lottery game number mapping (expand as needed based on actual game numbers)
// Format: Game Number -> { name, price }
const LOTTERY_GAMES: { [key: string]: { name: string; price: number } } = {
  '001': { name: 'Lucky 7s', price: 1 },
  '002': { name: 'Triple Match', price: 2 },
  '003': { name: 'Gold Rush', price: 5 },
  '004': { name: 'Diamond Jackpot', price: 10 },
  '005': { name: 'Cash Blast', price: 1 },
  '006': { name: 'Money Tree', price: 2 },
  '007': { name: 'Fortune Cookie', price: 3 },
  '008': { name: 'Wild Cherries', price: 1 },
  '009': { name: 'Lucky Clover', price: 5 },
  '010': { name: 'Star Power', price: 2 },
  '011': { name: 'Cash Cow', price: 3 },
  '012': { name: 'Treasure Hunt', price: 10 },
  '013': { name: 'Rainbow Riches', price: 1 },
  '014': { name: 'Royal Flush', price: 5 },
  '015': { name: 'Lucky Dice', price: 2 },
  '016': { name: 'Money Bag', price: 3 },
  '017': { name: 'Golden Ticket', price: 10 },
  '018': { name: 'Cash Explosion', price: 1 },
  '019': { name: 'Win Big', price: 5 },
  '020': { name: 'Jackpot Fever', price: 2 },
  '021': { name: 'Lucky Numbers', price: 1 },
  '022': { name: 'Cash Wave', price: 3 },
  '023': { name: 'Money Mania', price: 5 },
  '024': { name: 'Winning Streak', price: 2 },
  '025': { name: 'Pot of Gold', price: 10 },
  '026': { name: 'Fast Cash', price: 1 },
  '027': { name: 'Lucky Stars', price: 2 },
  '028': { name: 'Cash Bonanza', price: 5 },
  '029': { name: 'Money Multiplier', price: 3 },
  '030': { name: 'Mega Bucks', price: 10 },
  '031': { name: 'Lucky Break', price: 1 },
  '032': { name: 'Cash Prize', price: 2 },
  '033': { name: 'Golden Fortune', price: 5 },
  '034': { name: 'Money Magic', price: 3 },
  '035': { name: 'Jackpot King', price: 10 },
  '036': { name: 'Cash Flow', price: 1 },
  '037': { name: 'Win Spin', price: 2 },
  '038': { name: 'Lucky Wheel', price: 5 },
  '039': { name: 'Money Madness', price: 3 },
  '040': { name: 'Cash Kingdom', price: 10 },
  '041': { name: 'Lucky Day', price: 1 },
  '042': { name: 'Instant Win', price: 2 },
  '043': { name: 'Golden Gates', price: 5 },
  '044': { name: 'Money Rush', price: 3 },
  '045': { name: 'Super Jackpot', price: 10 },
  '046': { name: 'Cash Carnival', price: 1 },
  '047': { name: 'Lucky Spin', price: 2 },
  '048': { name: 'Gold Mine', price: 5 },
  '049': { name: 'Money Storm', price: 3 },
  '050': { name: 'Mega Fortune', price: 10 },
};

/**
 * Main decoder function - tries multiple decoding strategies
 */
export function decodeBarcode(barcodeData: string): DecodedTicket {
  const raw = barcodeData.trim();

  // Strategy 1: Long numeric format (20 digits) - 02302085100671714542
  // Format: GameNumber(3) + TicketSerial(6) + PackNumber(3) + CheckDigits(8)
  if (/^\d{20}$/.test(raw)) {
    return decodeLongNumericFormat(raw);
  }

  // Strategy 2: Medium numeric format (15 digits) - 023020851006717
  // Format: GameNumber(3) + TicketSerial(6) + PackNumber(3) + CheckDigits(3)
  if (/^\d{15}$/.test(raw)) {
    return decodeMediumNumericFormat(raw);
  }

  // Strategy 3: Short numeric format (12 digits) - 023020851006
  // Format: GameNumber(3) + TicketSerial(6) + PackNumber(3)
  if (/^\d{12}$/.test(raw)) {
    return decodeShortNumericFormat(raw);
  }

  // Strategy 4: Scratch-off lottery format with hyphens (023-020851-006)
  // Format: GameNumber-TicketNumber-PackNumber
  if (/^\d{3}-\d{6}-\d{3}$/.test(raw)) {
    return decodeScratchOffFormat(raw);
  }

  // Strategy 5: Alternative hyphen-separated format
  if (raw.includes('-')) {
    return decodeHyphenFormat(raw);
  }

  // Strategy 6: EAN-13 / UPC format (13 digits) - 8124472280080
  if (/^\d{13}$/.test(raw)) {
    return decode13DigitFormat(raw);
  }

  // Strategy 7: Mixed alphanumeric (001L700452024)
  if (/^\d{3}[A-Z0-9]{2}\d+$/.test(raw)) {
    return decodeMixedFormat(raw);
  }

  // Strategy 8: Custom pattern with prefix
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
 * Decode long numeric format: 02302085100671714542 (20 digits)
 * Format: GameNumber(3) + TicketSerial(6) + PackNumber(3) + CheckDigits(8)
 */
function decodeLongNumericFormat(data: string): DecodedTicket {
  try {
    const gameNumber = data.substring(0, 3);
    const ticketNumber = data.substring(3, 9);
    const packNumber = data.substring(9, 12);
    const checkDigits = data.substring(12, 20);

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || `Game ${gameNumber}`,
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      serialNumber: `${gameNumber}-${ticketNumber}-${packNumber}`,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode medium numeric format: 023020851006717 (15 digits)
 * Format: GameNumber(3) + TicketSerial(6) + PackNumber(3) + CheckDigits(3)
 */
function decodeMediumNumericFormat(data: string): DecodedTicket {
  try {
    const gameNumber = data.substring(0, 3);
    const ticketNumber = data.substring(3, 9);
    const packNumber = data.substring(9, 12);
    const checkDigits = data.substring(12, 15);

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || `Game ${gameNumber}`,
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      serialNumber: `${gameNumber}-${ticketNumber}-${packNumber}`,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode short numeric format: 023020851006 (12 digits)
 * Format: GameNumber(3) + TicketSerial(6) + PackNumber(3)
 */
function decodeShortNumericFormat(data: string): DecodedTicket {
  try {
    const gameNumber = data.substring(0, 3);
    const ticketNumber = data.substring(3, 9);
    const packNumber = data.substring(9, 12);

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || `Game ${gameNumber}`,
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      serialNumber: `${gameNumber}-${ticketNumber}-${packNumber}`,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode scratch-off lottery format: 023-020851-006
 * Format: GameNumber-TicketSerialNumber-PackNumber
 */
function decodeScratchOffFormat(data: string): DecodedTicket {
  try {
    const parts = data.split('-');

    if (parts.length !== 3) {
      return { raw: data, isValid: false, error: 'Invalid scratch-off format' };
    }

    const gameNumber = parts[0];
    const ticketNumber = parts[1];
    const packNumber = parts[2];

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || `Game ${gameNumber}`,
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      serialNumber: `${gameNumber}-${ticketNumber}-${packNumber}`,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
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

    const gameNumber = parts[0];
    const ticketNumber = parts[2];
    const packNumber = parts[3] || '';

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || 'Unknown Lottery',
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode 13-digit format: 8124472280080
 * This could be UPC/EAN-13 or an alternative lottery format
 * Try multiple interpretations
 */
function decode13DigitFormat(data: string): DecodedTicket {
  try {
    // Try interpretation 1: First 3 digits as game number
    const gameNumber1 = data.substring(0, 3);
    const gameInfo1 = LOTTERY_GAMES[gameNumber1];

    if (gameInfo1) {
      // Format: GameNumber(3) + TicketSerial(7) + Pack(3)
      return {
        raw: data,
        gameNumber: gameNumber1,
        lotteryName: gameInfo1.name,
        ticketNumber: data.substring(3, 10),
        packNumber: data.substring(10, 13),
        price: gameInfo1.price,
        serialNumber: `${gameNumber1}-${data.substring(3, 10)}`,
        isValid: true,
      };
    }

    // Try interpretation 2: Check if this might be a price/UPC barcode
    // Typically price barcodes start with specific prefixes
    if (data.startsWith('812') || data.startsWith('0')) {
      return {
        raw: data,
        isValid: false,
        error: 'This appears to be a price/UPC barcode. Please scan the INFORMATION barcode (longer barcode with ticket details).',
      };
    }

    // Default: treat as unknown 13-digit format
    return {
      raw: data,
      isValid: false,
      error: 'Unknown 13-digit format. Expected 12, 15, or 20 digit lottery barcode.',
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
    const gameNumber = data.substring(0, 3);
    const ticketNumber = data.substring(5, 11);
    const packNumber = data.substring(11);

    const gameInfo = LOTTERY_GAMES[gameNumber];

    return {
      raw: data,
      gameNumber,
      lotteryName: gameInfo?.name || `Game ${gameNumber}`,
      ticketNumber,
      packNumber,
      price: gameInfo?.price,
      isValid: true,
    };
  } catch (error) {
    return { raw: data, isValid: false, error: 'Parse error' };
  }
}

/**
 * Decode prefix format: LT-001-020851-006 or SCR-020851
 */
function decodePrefixFormat(data: string): DecodedTicket {
  try {
    const parts = data.split('-');
    const prefix = parts[0];

    if (prefix === 'LT' && parts.length >= 4) {
      const gameNumber = parts[1];
      const ticketNumber = parts[2];
      const packNumber = parts[3];
      const gameInfo = LOTTERY_GAMES[gameNumber];

      return {
        raw: data,
        gameNumber,
        lotteryName: gameInfo?.name || `Game ${gameNumber}`,
        ticketNumber,
        packNumber,
        price: gameInfo?.price,
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

  if (decoded.lotteryName) parts.push(`Game: ${decoded.lotteryName}`);
  if (decoded.gameNumber) parts.push(`Game Number: ${decoded.gameNumber}`);
  if (decoded.ticketNumber) parts.push(`Ticket Serial: ${decoded.ticketNumber}`);
  if (decoded.packNumber) parts.push(`Pack Number: ${decoded.packNumber}`);
  if (decoded.price) parts.push(`Price: $${decoded.price}`);

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
 * Check if barcode belongs to a specific lottery game
 */
export function matchesLottery(barcodeData: string, gameNumber: string): boolean {
  const decoded = decodeBarcode(barcodeData);
  return decoded.gameNumber === gameNumber;
}
