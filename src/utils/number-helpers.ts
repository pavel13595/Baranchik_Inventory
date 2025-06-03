/**
 * Parses a decimal input that may contain commas as decimal separators
 * @param input The string input to parse
 * @returns The parsed number value
 */
export const parseDecimalInput = (input: string): number => {
  // Replace commas with dots for proper number parsing
  const normalizedInput = input.replace(',', '.');
  
  // Parse the value and ensure it's not negative
  const parsedValue = parseFloat(normalizedInput);
  
  // Return 0 if parsing failed or value is NaN
  if (isNaN(parsedValue)) {
    return 0;
  }
  
  // Ensure the value is not negative and has at most 2 decimal places
  return Math.max(0, Number(parsedValue.toFixed(2)));
};
