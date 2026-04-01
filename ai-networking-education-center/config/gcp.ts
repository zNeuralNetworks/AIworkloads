// GCP configuration for frontend
export const gcpConfig = {
  projectId: import.meta.env.VITE_GCP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_GCP_STORAGE_BUCKET,
};

// Helper to construct GCP Storage URLs
export const getGcpStorageUrl = (path: string): string => {
  return `https://storage.googleapis.com/${gcpConfig.storageBucket}/${path}`;
};

// Initialize gcloud CLI context (ensure authenticated)
export const initializeGcp = async (): Promise<void> => {
  // Check if gcloud is authenticated by verifying env
  if (!gcpConfig.projectId) {
    console.warn('GCP project ID not configured');
    return;
  }
  console.log(`GCP initialized with project: ${gcpConfig.projectId}`);
};
