// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false
};

export const digitalocean = {
  accessKeyId: "XYWXQG6AIL2ALTADBF53",
  secretAccessKey: "j93g467IKFw7xHPeLa1QjPflfMHT30/OtwJghVA6qRA",
  region: "sgp1" // Singapore region
};

export const domain = "https://app.socialalpha.jaagalabs.com";

export const fileUploadVariables = {
  UploadUrlEndpoint:
    "http://minio-microservice.dev.jaagalabs.com/create_presigned_url",
  bucketName: "test",
  accessUrl: "http://minio-storage.dev.jaagalabs.com"
};
