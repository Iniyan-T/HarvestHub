/**
 * Validate MongoDB ObjectId format (24 hex characters)
 * @param id - The string to validate
 * @returns true if the id is a valid ObjectId format
 */
export const isValidObjectId = (id: string | null | undefined): boolean => {
  return !!id && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Get valid user ID from URL params or localStorage
 * @param urlUserId - User ID from URL params
 * @returns The validated userId and basePath
 */
export const getValidatedUserId = (urlUserId: string | undefined): { userId: string; basePath: string } => {
  const storedUserId = localStorage.getItem('userId');
  const validUrlUserId = isValidObjectId(urlUserId) ? urlUserId! : null;
  const validStoredUserId = isValidObjectId(storedUserId) ? storedUserId! : null;
  const userId = validUrlUserId || validStoredUserId || '';
  return {
    userId,
    basePath: `/${userId}`
  };
};
