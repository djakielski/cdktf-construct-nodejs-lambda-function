import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    // @ts-ignore
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    return context.logStreamName;
};