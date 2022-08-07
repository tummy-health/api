import StorageError from '@src/storage/storageError';

class MissingLocationError extends StorageError {
  constructor({ location }: { location: string }) {
    super(`Directory '${location}' could not be found.`);
  }
}

export default MissingLocationError;
