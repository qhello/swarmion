/* eslint-disable max-lines */
import type {
  APIGatewayEventRequestContextV2WithAuthorizer,
  APIGatewayProxyCognitoAuthorizer,
} from 'aws-lambda';
import createHttpError from 'http-errors';

import { ApiGatewayContract } from 'contracts';

import { httpApiGatewayContractMock } from '../__mocks__/httpApiGatewayContract';
import {
  getHandlerContextMock,
  getRequestContextMock,
  getRequestContextMockV2,
} from '../__mocks__/requestContext';
import { getHandler } from '../features';
import { HandlerType } from '../types';

describe('apiGateway lambda handler', () => {
  describe('httpApi, with authorizer, when all parameters are set', () => {
    it('should return a 200 response', async () => {
      const httpApiContract = httpApiGatewayContractMock;

      const fakeRequestContext: APIGatewayEventRequestContextV2WithAuthorizer<APIGatewayProxyCognitoAuthorizer> =
        {
          ...getRequestContextMockV2(),
          authorizer: { claims: { foo: 'claimBar' } },
        };
      const fakeContext = getHandlerContextMock();

      const handler: HandlerType<typeof httpApiContract> = ({
        body,
        pathParameters,
        queryStringParameters,
        headers,
        requestContext,
      }) => {
        const myCustomClaim: string = requestContext.authorizer.claims.foo;

        const name =
          body.foo +
          pathParameters.pageNumber +
          queryStringParameters.testId +
          headers.myHeader +
          myCustomClaim;

        return Promise.resolve({ id: 'hello', name });
      };
      const httpHandler = getHandler(httpApiContract)(handler);

      const result = await httpHandler(
        {
          pathParameters: { userId: 'toto', pageNumber: '15' },
          body: JSON.stringify({ foo: 'bar' }),
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          queryStringParameters: { testId: 'myTestId' },
          requestContext: fakeRequestContext,
          version: '',
          routeKey: '',
          rawPath: '',
          rawQueryString: '',
          isBase64Encoded: false,
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: JSON.stringify({
          id: 'hello',
          name: 'bar15myTestIdMyCustomHeaderclaimBar',
        }),
        statusCode: 200,
      });
    });

    it('should return a error response when throwing httpError in handler', async () => {
      const httpApiContract = httpApiGatewayContractMock;

      const fakeRequestContext: APIGatewayEventRequestContextV2WithAuthorizer<APIGatewayProxyCognitoAuthorizer> =
        {
          ...getRequestContextMockV2(),
          authorizer: { claims: { foo: 'claimBar' } },
        };
      const fakeContext = getHandlerContextMock();

      const handler: HandlerType<typeof httpApiContract> = ({
        body,
        pathParameters,
        queryStringParameters,
        headers,
        requestContext,
      }) => {
        const myCustomClaim: string = requestContext.authorizer.claims.foo;

        const name =
          body.foo +
          pathParameters.pageNumber +
          queryStringParameters.testId +
          headers.myHeader +
          myCustomClaim;

        throw createHttpError(500, name, { expose: true });
      };
      const httpHandler = getHandler(httpApiContract)(handler);

      const result = await httpHandler(
        {
          pathParameters: { userId: 'toto', pageNumber: '15' },
          body: JSON.stringify({ foo: 'bar' }),
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          queryStringParameters: { testId: 'myTestId' },
          requestContext: fakeRequestContext,
          version: '',
          routeKey: '',
          rawPath: '',
          rawQueryString: '',
          isBase64Encoded: false,
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: 'bar15myTestIdMyCustomHeaderclaimBar',
        statusCode: 500,
      });
    });

    it('should return a error response when input is invalid', async () => {
      const httpApiContract = httpApiGatewayContractMock;

      const fakeRequestContext: APIGatewayEventRequestContextV2WithAuthorizer<APIGatewayProxyCognitoAuthorizer> =
        {
          ...getRequestContextMockV2(),
          authorizer: { claims: { foo: 'claimBar' } },
        };
      const fakeContext = getHandlerContextMock();

      const handler: HandlerType<typeof httpApiContract> = ({
        body,
        pathParameters,
        queryStringParameters,
        headers,
        requestContext,
      }) => {
        const myCustomClaim: string = requestContext.authorizer.claims.foo;

        const name =
          body.foo +
          pathParameters.pageNumber +
          queryStringParameters.testId +
          headers.myHeader +
          myCustomClaim;

        throw createHttpError(500, name);
      };
      const httpHandler = getHandler(httpApiContract)(handler);

      const result = await httpHandler(
        {
          pathParameters: { userId: 'toto', pageNumber: '15' },
          body: JSON.stringify({ bar: 'foo' }),
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          queryStringParameters: { testId: 'myTestId' },
          requestContext: fakeRequestContext,
          version: '',
          routeKey: '',
          rawPath: '',
          rawQueryString: '',
          isBase64Encoded: false,
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: 'Invalid input',
        statusCode: 400,
      });
    });

    it('should return a error response when output is invalid', async () => {
      const httpApiContract = httpApiGatewayContractMock;

      const fakeRequestContext: APIGatewayEventRequestContextV2WithAuthorizer<APIGatewayProxyCognitoAuthorizer> =
        {
          ...getRequestContextMockV2(),
          authorizer: { claims: { foo: 'claimBar' } },
        };
      const fakeContext = getHandlerContextMock();

      const handler: HandlerType<typeof httpApiContract> = () => {
        return Promise.resolve({ id: 'hello', name: 5 as unknown as string });
      };
      const httpHandler = getHandler(httpApiContract)(handler);

      const result = await httpHandler(
        {
          pathParameters: { userId: 'toto', pageNumber: '15' },
          body: JSON.stringify({ foo: 'bar' }),
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          queryStringParameters: { testId: 'myTestId' },
          requestContext: fakeRequestContext,
          version: '',
          routeKey: '',
          rawPath: '',
          rawQueryString: '',
          isBase64Encoded: false,
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: 'Invalid output',
        statusCode: 400,
      });
    });

    it('should accept optional additional arguments', async () => {
      const outputSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
        additionalProperties: false,
      } as const;

      const httpApiContract = new ApiGatewayContract({
        id: 'testContract',
        path: '/hello',
        method: 'POST',
        integrationType: 'httpApi',
        authorizerType: undefined,
        pathParametersSchema: undefined,
        queryStringParametersSchema: undefined,
        headersSchema: undefined,
        bodySchema: undefined,
        outputSchema,
      });

      const fakeRequestContext: APIGatewayEventRequestContextV2WithAuthorizer<undefined> =
        getRequestContextMockV2({ routeKey: 'blob' });

      const handler: HandlerType<typeof httpApiContract> = (
        { requestContext },
        _context,
        toto: { tata: string } = { tata: 'coucou' },
      ) => {
        const name = toto.tata + requestContext.routeKey;

        return Promise.resolve({ name });
      };
      const httpHandler = getHandler(httpApiContract)(handler);
      const fakeContext = getHandlerContextMock();

      const result = await httpHandler(
        {
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          requestContext: fakeRequestContext,
          version: '',
          routeKey: fakeRequestContext.routeKey,
          rawPath: '',
          rawQueryString: '',
          isBase64Encoded: false,
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: '{"name":"coucoublob"}',
        statusCode: 200,
      });
    });
  });

  describe('restApi, without authorizer, with subset of parameters', () => {
    it('should return a 200 response', async () => {
      const restApiContract = new ApiGatewayContract({
        id: 'testContract',
        path: '/hello',
        method: 'POST',
        integrationType: 'restApi',
        authorizerType: undefined,
        pathParametersSchema: undefined,
        queryStringParametersSchema: undefined,
        headersSchema: undefined,
        bodySchema: undefined,
        outputSchema: undefined,
      });

      const handler: HandlerType<typeof restApiContract> = async () => {
        await Promise.resolve();

        return;
      };
      const fakeContext = getHandlerContextMock();

      const httpHandler = getHandler(restApiContract)(handler);

      const result = await httpHandler(
        {
          pathParameters: { userId: 'toto', pageNumber: '15' },
          body: JSON.stringify({ foo: 'bar' }),
          headers: {
            myHeader: 'MyCustomHeader',
            anotherHeader: 'anotherHeader',
          },
          queryStringParameters: { testId: 'myTestId' },
          requestContext: getRequestContextMock(),
          multiValueHeaders: {},
          httpMethod: '',
          isBase64Encoded: false,
          path: '',
          multiValueQueryStringParameters: null,
          stageVariables: null,
          resource: '',
        },
        fakeContext,
        () => null,
      );

      expect(result).toEqual({
        body: '',
        statusCode: 200,
      });
    });
  });
});
