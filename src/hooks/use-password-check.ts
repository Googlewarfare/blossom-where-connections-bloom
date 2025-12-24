/**
 * Check if a password has been exposed in known data breaches
 * Uses the HaveIBeenPwned API with k-anonymity (only sends first 5 chars of SHA-1 hash)
 */
export async function checkPasswordBreach(password: string): Promise<{ breached: boolean; count: number }> {
  try {
    // Create SHA-1 hash of password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Split hash: first 5 chars for API, rest for local matching
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    // Query HaveIBeenPwned API (k-anonymity model - only sends prefix)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Prevent response length analysis
      },
    });
    
    if (!response.ok) {
      // If API fails, don't block user - just log and continue
      console.warn('Password breach check unavailable');
      return { breached: false, count: 0 };
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Check if our suffix appears in the results
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const count = parseInt(countStr.trim(), 10);
        return { breached: true, count };
      }
    }
    
    return { breached: false, count: 0 };
  } catch (error) {
    // Don't block signup if the check fails
    console.warn('Password breach check failed:', error);
    return { breached: false, count: 0 };
  }
}
