const sanitizeString = (value, maxLength = 500) => {
  if (value === undefined || value === null) {
    return '';
  }

  return `${value}`
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const sanitizeList = (value, maxItems = 20) => {
  const entries = Array.isArray(value) ? value : `${value || ''}`.split(',');
  return entries
    .map((entry) => sanitizeString(entry, 80))
    .filter(Boolean)
    .slice(0, maxItems);
};

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseFutureDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

module.exports = {
  sanitizeString,
  sanitizeList,
  parsePositiveNumber,
  parseOptionalNumber,
  parseFutureDate,
};
