export class CommonHelperService {
    sendResponse(res: any, statusCode: number, data: object[] | object = [], message: string = '') {
        const objResponse = {
            success: true,
            code: statusCode || 200,
        };

        Object.assign(objResponse, {
            ...objResponse,
            data,
        });

        if (message.length > 0) {
            Object.assign(objResponse, {
                ...objResponse,
                message,
            });
        }
        return res.status(statusCode).json(objResponse);
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

}