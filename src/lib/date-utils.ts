export function parseEventDate(dateStr: string | null): number {
    if (!dateStr) return 0;

    let sanitizedStr = dateStr.trim();

    // 1. Handle ISO 8601 / UTC formats (e.g., 2024-03-25T10:00:00Z)
    // JS Date constructor usually handles this well, but let's try it first
    const isoParsed = new Date(sanitizedStr).getTime();
    if (!isNaN(isoParsed) && sanitizedStr.includes("-") && sanitizedStr.includes("T")) {
        return isoParsed;
    }

    // 2. Handle DD/MM/YYYY (Legacy format often used in DB)
    const ddMmYyyyMatch = sanitizedStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddMmYyyyMatch) {
        const [_, day, month, year] = ddMmYyyyMatch;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
        ).getTime();
    }

    // 3. Handle 'IST' or other timezone suffixes
    if (sanitizedStr.includes("IST")) {
        sanitizedStr = sanitizedStr.replace("IST", "+05:30");
    }

    const parsed = new Date(sanitizedStr).getTime();
    if (!isNaN(parsed)) {
        return parsed;
    }

    // 4. Fallback: Try regex matching for formats like "September 11, 2024 10:00 AM"
    const wordMonthMatch = sanitizedStr.match(
        /([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})(.*)/,
    );
    if (wordMonthMatch) {
        const [_, monthStr, day, year, rest] = wordMonthMatch;
        const timeStr = rest.trim() || "";
        const tempDate = new Date(`${monthStr} ${day}, ${year} ${timeStr}`);
        if (!isNaN(tempDate.getTime())) {
            return tempDate.getTime();
        }
    }

    // 5. Final attempt for just YYYY-MM-DD
    const yyyyMmDdMatch = sanitizedStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyyMmDdMatch) {
        const [_, year, month, day] = yyyyMmDdMatch;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
        ).getTime();
    }

    // Return 0 if completely unparseable
    console.warn(`[date-utils] Failed to parse date string: "${dateStr}"`);
    return 0;
}
