import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import logger from "./logger.service";

const region = process.env.REGION || 'us-east-1'
const bucketName = 'sample-app-1238523'
export class AwsHelperService {
    public s3Clent: S3Client
    constructor() {
        this.s3Clent = new S3Client({ region });
    }

    async upload(key: string, mimeType: string) {
        try {
            const payload = {
                Key: key,
                Bucket: 'sample-app-1238523',
                ContentType: mimeType,
            };

            const command = new PutObjectCommand(payload);

            const url = await getSignedUrl(this.s3Clent, command);
            return url;
        } catch (error) {
            logger.error('Error in upload from aws.s3.service', error);
            throw error;
        }
    }

    async getObject(fileName: string) {
        try {
            const payload = {
                Bucket: bucketName,
                Key: fileName,
            };

            const command = new GetObjectCommand(payload);


            const url = await getSignedUrl(this.s3Clent, command);

            return url;
        } catch (error) {
            logger.error('[Error] From getSignedUrlBucket in aws.s3.service', error);
            throw error;
        }
    }

    async sendEmail(params: SendEmailCommandInput) {
        try {
            const ses = new SESClient({ region: process.env.AWS_REGION });

            // Create and send email command
            const command = new SendEmailCommand(params);
            const sesResult = await ses.send(command);

            return sesResult;

        } catch (error) {
            logger.error('Error in sendEmail', error);
            throw error;
        }
    }
}