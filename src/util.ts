import uuidv4 from 'uuid/v4'

/**
 * Build path from arguments.
 * @param ...args Variable number of segments to build path from
 */
export const buildPath = (...args): string => {
  return args.filter((segment): boolean => segment !== undefined).join('/')
}

/**
 * Generate random file name.
 * @param name Name of file
 * @param type Type of file
 */
export const genRandomFileName = (name?: string, type?: string): string => {
  let fileName = uuidv4()

  if (name) {
    const splitName = name.split('.')

    if (splitName.length > 1) fileName += `.${splitName[splitName.length - 1]}`
    // } else if(type) {
    //   // go through possible file types
    // }
  }

  return fileName
}
