export const environment = {
  production: true
};

export const domain = 'https://oip-dev.dev.jaagalabs.com';

export const fileUploadVariables = {
  UploadUrlEndpoint:
    'https://minio-microservice.dev.jaagalabs.com/create_presigned_url',
  bucketName: 'test',
  accessUrl: 'https://minio-storage.dev.jaagalabs.com',
  deleteEndpoint: 'https://minio-microservice.dev.jaagalabs.com/delete_file'
};
