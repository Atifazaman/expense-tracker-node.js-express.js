const AWS = require("aws-sdk");
require("dotenv").config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = async (fileContent, fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: "text/csv",
  };

  const data = await s3.upload(params).promise();
  return data.Location; 
};

module.exports=uploadToS3