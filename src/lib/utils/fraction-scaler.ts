/**
 * Fraction Scaler Utility
 * Mengubah takaran bahan masakan berdasarkan rasio porsi (multiplier)
 * dengan konversi desimal ke pecahan kuliner (1/4, 1/3, 1/2, 2/3, 3/4).
 */

export function scaleQuantity(detail: string, mult: number): string {
  if (!detail || mult === 1) return detail;

  const regex = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+)/g;

  return detail.replace(regex, (match) => {
    let val = 0;
    if (match.includes('/')) {
      if (match.includes(' ')) {
        const parts = match.split(/\s+/);
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split('/');
        const frac = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        val = whole + frac;
      } else {
        const parts = match.split('/');
        val = parseFloat(parts[0]) / parseFloat(parts[1]);
      }
    } else {
      val = parseFloat(match);
    }

    if (isNaN(val)) return match;

    const scaled = val * mult;
    const whole = Math.floor(scaled);
    const remainder = scaled - whole;
    const epsilon = 0.08;

    if (Math.abs(remainder) < epsilon) {
      return whole === 0 ? "0" : whole.toString();
    }
    if (Math.abs(remainder - 0.5) < epsilon) {
      return whole === 0 ? "1/2" : `${whole} 1/2`;
    }
    if (Math.abs(remainder - 0.25) < epsilon) {
      return whole === 0 ? "1/4" : `${whole} 1/4`;
    }
    if (Math.abs(remainder - 0.75) < epsilon) {
      return whole === 0 ? "3/4" : `${whole} 3/4`;
    }
    if (Math.abs(remainder - 0.33) < epsilon) {
      return whole === 0 ? "1/3" : `${whole} 1/3`;
    }
    if (Math.abs(remainder - 0.66) < epsilon) {
      return whole === 0 ? "2/3" : `${whole} 2/3`;
    }

    return parseFloat(scaled.toFixed(2)).toString();
  });
}
