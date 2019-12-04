// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const environment = {
  production: false
};

const domain = 'https://oip-dev.dev.jaagalabs.com';

const fileUploadVariables = {
  UploadUrlEndpoint:
    'https://minio-microservice.dev.jaagalabs.com/create_presigned_url',
  bucketName: 'test',
  accessUrl: 'https://minio-storage.dev.jaagalabs.com',
  deleteEndpoint: 'https://minio-microservice.dev.jaagalabs.com/delete_file'
};

export { environment, domain, fileUploadVariables };
