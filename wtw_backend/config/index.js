module.exports = {
    PORT: 3000,
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.BASE_URL,
    API_PORT: process.env.API_PORT,
    LOCAL_FOLDER_PATH: process.env.LOCAL_FOLDER_PATH,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_API_VERSION: process.env.AWS_API_VERSION,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_BUCKETNAME: process.env.AWS_S3_BUCKETNAME,
    AWS_S3_BUCKET_URL: process.env.AWS_S3_BUCKET_URL,
    ALLOWED_FILE_TYPES: ['.png', '.jpg', '.gif', '.jpeg', '.mp3', '.wav'],
}
