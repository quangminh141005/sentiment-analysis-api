import { Handler } from 'aws-lambda'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

const lambdaClient = new LambdaClient({});
const ML_LAMBDA_NAME = process.env.ML_LAMBDA_NAME;


export const handler: Handler = async (event) => {
    try {
        // validate request
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error:'Request body is required'}),
            };
        }

        const body = JSON.parse(event.body);

        if (!body.text || typeof body.text !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'Invalid or missing text field'}),
            };
        }

        // Invoke ML lambda 
        const command = new InvokeCommand({
            FunctionName: ML_LAMBDA_NAME,
            Payload: JSON.stringify({
                body: JSON.stringify({ text: body.text }),
            }),
        });

        const response = await lambdaClient.send(command);
        const payload = JSON.parse(new TextDecoder().decode(response.Payload));

        // return result
        return {
            statusCode: payload.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: payload.body,
        };
    } catch (error) {
        console.error('Error', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error'}),
        }
    }
};