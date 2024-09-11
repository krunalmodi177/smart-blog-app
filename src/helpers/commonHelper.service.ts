import { Parser } from 'json2csv';
import jsPDF from 'jspdf';
import i18n from "../i18n";
import { Response } from 'express';
import path from 'path';
import axios from 'axios';
import fs from 'fs';


import logger from './logger.service';

export class CommonHelperService {
    sendResponse(res: any, statusCode: number, data: object[] | object = [], message: string = '') {
        const translatedMessage = message.length > 0 ? i18n.__(message) : '';

        const objResponse = {
            success: true,
            code: statusCode || 200,
        };

        Object.assign(objResponse, {
            ...objResponse,
            data,
        });

        if (translatedMessage.length > 0) {
            Object.assign(objResponse, {
                ...objResponse,
                message,
            });
        }
        return res.status(statusCode).json(objResponse);
    }

    sendFileInResponse(
        res: Response,
        contentType: string,
        data: string | Buffer,
        filename: string,
    ) {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(data);
    }

    generateOTP(otpLength: number = 6) {
        let digits = '0123456789';
        let OTP = '';
        let len = digits.length
        for (let i = 0; i < otpLength; i++) {
            OTP += digits[Math.floor(Math.random() * len)];
        }
        return OTP;
    }

    convertJsonToCsv(jsonData: any[]): string {
        const fields = Object.keys(jsonData[0]);
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            return parser.parse(jsonData);
        } catch (err) {
            logger.error('Error converting JSON to CSV:', err);
            return '';
        }
    }

    async generatePDFBuffer(data: any): Promise<Buffer> {
        try {
            const doc = new jsPDF();

            // Set font
            doc.setFont("helvetica");

            // Add title
            doc.setFontSize(18);
            doc.text(data.title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

            // Add content
            doc.setFontSize(12);
            const splitContent = doc.splitTextToSize(data.content, 180);
            doc.text(splitContent, 15, 40);

            // Add category
            doc.setFontSize(10);
            doc.text(`Category: ${data.category}`, 15, doc.internal.pageSize.height - 20);

            // Add image if it exists
            const imageDataUrl = await this.convertImageToBase64('https://farm9.staticflickr.com/8505/8441256181_4e98d8bff5_z_d.jpg')
    
            doc.addImage(imageDataUrl, 'JPEG', 15, 70, 180, 100);

            // Return the PDF as a buffer
            return Buffer.from(doc.output('arraybuffer'));

        } catch (error) {
            logger.error('Error in generatePDFBuffer', error);
            throw error;
        }
    }
    async convertImageToBase64(imageUrl: string): Promise<string> {
        try {
            let imageBuffer: Buffer;

            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                // Remote URL
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data, 'binary');
            } else {
                // Local file path
                const fullPath = path.resolve(imageUrl);
                imageBuffer = await fs.promises.readFile(fullPath);
            }

            const base64Image = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(imageUrl);
            return `data:${mimeType};base64,${base64Image}`;
        } catch (error) {
            logger.error('Error converting image to base64:', error);
            throw error;
        }
    }

    getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.gif':
                return 'image/gif';
            case '.webp':
                return 'image/webp';
            default:
                return 'application/octet-stream';
        }
    }


}