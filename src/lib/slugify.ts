/**
 * Converts a string into a safe, lowercase URL slug.
 * Removes special characters and replaces spaces with hyphens.
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\./g, "-")            // Replace dots with -
        .replace(/\s+/g, "-")           // Replace spaces with -
        .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
        .replace(/\-\-+/g, "-")         // Replace multiple - with single -
        .replace(/^-+/, "")             // Trim - from start of text
        .replace(/-+$/, "");            // Trim - from end of text
}
