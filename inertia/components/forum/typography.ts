const NBSP = ' '
const NARROW_NBSP = ' '

/**
 * French typography for member-written titles: glue « » : ; ? ! to their
 * word with a no-break space (a fine one before ; ? !) so a line never
 * starts with ": « Could…".
 */
export function frenchSpacing(text: string) {
  return text
    .replace(/\s+([:»])/g, `${NBSP}$1`)
    .replace(/\s+([;?!])/g, `${NARROW_NBSP}$1`)
    .replace(/«\s+/g, `«${NBSP}`)
}
