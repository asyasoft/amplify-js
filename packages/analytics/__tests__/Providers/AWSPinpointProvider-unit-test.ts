jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    Pinpoint.prototype.putEvents = (params) => {
        return {
            on(event, callback) {
                callback();
            },
            send(callback) {
                callback(null, {
                    EventsResponse: {
                        Results: {
                            'endpointId' : {
                                EventsItemResponse :{
                                    'uuid': {
                                        Message: "Accepted",
                                        StatusCode: 202
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    return Pinpoint;
});

jest.mock('uuid', () => {
    const mockfn = () => {return 'uuid'};
    return { v1: mockfn };
})

import { AWS, JS, Credentials, ClientDevice } from '@aws-amplify/core';
import AnalyticsProvider from "../../src/Providers/AWSPinpointProvider";
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Cache from '@aws-amplify/core';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';

const endpointConfigure = {
    address: 'configured', // The unique identifier for the recipient. For example, an address could be a device token, email address, or mobile phone number.
    attributes: {
        // Custom attributes that your app reports to Amazon Pinpoint. You can use these attributes as selection criteria when you create a segment.
        hobbies: ['configured'],
    },
    channelType: 'configured', // The channel type. Valid values: APNS, GCM
    demographic: {
        appVersion: 'configured', // The version of the application associated with the endpoint.
        locale: 'configured', // The endpoint locale in the following format: The ISO 639-1 alpha-2 code, followed by an underscore, followed by an ISO 3166-1 alpha-2 value
        make: 'configured', // The manufacturer of the endpoint device, such as Apple or Samsung.
        model: 'configured', // The model name or number of the endpoint device, such as iPhone.
        modelVersion: 'configured', // The model version of the endpoint device.
        platform: 'configured', // The platform of the endpoint device, such as iOS or Android.
        platformVersion: 'configured', // The platform version of the endpoint device.
        timezone: 'configured' // The timezone of the endpoint. Specified as a tz database value, such as Americas/Los_Angeles.
    },
    location: {
        city: 'configured', // The city where the endpoint is located.
        country: 'configured', // The two-letter code for the country or region of the endpoint. Specified as an ISO 3166-1 alpha-2 code, such as "US" for the United States.
        latitude: 0, // The latitude of the endpoint location, rounded to one decimal place.
        longitude: 0, // The longitude of the endpoint location, rounded to one decimal place.
        postalCode: 'configured', // The postal code or zip code of the endpoint.
        region: 'configured' // The region of the endpoint location. For example, in the United States, this corresponds to a state.
    },
    metrics: {
        // Custom metrics that your app reports to Amazon Pinpoint.
    },
    /** Indicates whether a user has opted out of receiving messages with one of the following values:
        * ALL - User has opted out of all messages.
        * NONE - Users has not opted out and receives all messages.
        */
    optOut: 'configured',
    // Customized userId
    userId: 'configured',
    // User attributes
    userAttributes: {
        interests: ['configured']
        // ...
    }
};

const defaultEndpointConfigure = {
    address: 'default', // The unique identifier for the recipient. For example, an address could be a device token, email address, or mobile phone number.
    attributes: {
        // Custom attributes that your app reports to Amazon Pinpoint. You can use these attributes as selection criteria when you create a segment.
        hobbies: ['default'],
    },
    channelType: 'default', // The channel type. Valid values: APNS, GCM
    demographic: {
        appVersion: 'default', // The version of the application associated with the endpoint.
        locale: 'default', // The endpoint locale in the following format: The ISO 639-1 alpha-2 code, followed by an underscore, followed by an ISO 3166-1 alpha-2 value
        make: 'default', // The manufacturer of the endpoint device, such as Apple or Samsung.
        model: 'default', // The model name or number of the endpoint device, such as iPhone.
        modelVersion: 'default', // The model version of the endpoint device.
        platform: 'default', // The platform of the endpoint device, such as iOS or Android.
        platformVersion: 'default', // The platform version of the endpoint device.
        timezone: 'default' // The timezone of the endpoint. Specified as a tz database value, such as Americas/Los_Angeles.
    },
    location: {
        city: 'default', // The city where the endpoint is located.
        country: 'default', // The two-letter code for the country or region of the endpoint. Specified as an ISO 3166-1 alpha-2 code, such as "US" for the United States.
        latitude: 0, // The latitude of the endpoint location, rounded to one decimal place.
        longitude: 0, // The longitude of the endpoint location, rounded to one decimal place.
        postalCode: 'default', // The postal code or zip code of the endpoint.
        region: 'default' // The region of the endpoint location. For example, in the United States, this corresponds to a state.
    },
    metrics: {
        // Custom metrics that your app reports to Amazon Pinpoint.
    },
    /** Indicates whether a user has opted out of receiving messages with one of the following values:
        * ALL - User has opted out of all messages.
        * NONE - Users has not opted out and receives all messages.
        */
    optOut: 'default',
    // Customized userId
    userId: 'default',
    // User attributes
    userAttributes: {
        interests: ['default']
        // ...
    }
};


const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

const clientInfo = {
    appVersion: '1.0',
    make: 'make',
    model: 'model',
    version: '1.0.0',
    platform: 'platform'
}

const options = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region'
}

const optionsWithDefaultEndpointConfigure = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region',
    endpoint: defaultEndpointConfigure
}

const optionsWithClientContext = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region',
    clientContext: {
        clientId: 'clientId',
        appTitle: 'appTitle',
        appVersionName: 'appVersionName',
        appVersionCode: 'appVersionCode',
        appPackageName: 'appPackageName',
        platform: 'platform',
        platformVersion: 'platformVersion',
        model: 'model',
        make: 'make',
        locale: 'locale'
    }
};

const optionsWithoutId = {
    appId: undefined,
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region'
};

const optionsWithoutRegion = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: undefined
};

let response = {
    EventsResponse: {
        Results: {
            'endpointId' : {
                EventsItemResponse :{
                    'uuid': {
                        Message: "Accepted",
                        StatusCode: 202
                    }
                }
            }
        }
    }
}

const timeSpyOn = jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => {
    return 1526939075455;
});

const timeSpyOn2 = jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
    return 'isoString';
});
const timestamp = new Date().getTime();

jest.spyOn(ClientDevice, 'clientInfo').mockImplementation(() => {
    return {
        appVersion: 'clientInfoAppVersion',
        make: 'clientInfoMake',
        model: 'clientInfoModel',
        version: 'clientInfoVersion',
        platform: 'clientInfoPlatform'
    }
});

let resolve = null;
let reject = null;

beforeEach(() => {
    jest.useFakeTimers();
    resolve = jest.fn();
    reject = jest.fn();
});

describe("AnalyticsProvider test", () => {
    describe('getCategory test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.getCategory()).toBe('Analytics');
        });
    });

    describe('getProviderName test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.getProviderName()).toBe('AWSPinpoint');
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.configure({appId: 'appId'})).toEqual({"appId": "appId", "bufferSize": 1000, "flushInterval": 5000, "flushSize": 100, "resendLimit": 5});
        });
    });

    describe('record test', () => {
        test('record without credentials', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(options);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            await analytics.record('params', {resolve, reject});
            expect(reject).toBeCalled();
            spyon.mockClear();
        });

        test('record without appId', async () => {
            const analytics = new AnalyticsProvider();
            const { appId, ...rest } = options;
            analytics.configure(rest);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            await analytics.record('params', {resolve, reject});
            expect(reject).toBeCalled();
            spyon.mockClear();
        });

        test('record without region', async () => {
            const analytics = new AnalyticsProvider();
            const { region, ...rest } = options;
            analytics.configure(rest);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            await analytics.record('params', {resolve, reject});
            expect(reject).toBeCalled();
            spyon.mockClear();
        });
  
        describe('startsession test', () => {
            test('happy case', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback(null, response);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

                const params = {event: { name: '_session.start', immediate: true}};
                await analytics.record(params, {resolve, reject});

                expect(spyon).toBeCalledWith({
                    "ApplicationId": "appId",
                    "EventsRequest": {
                        "BatchItem": {
                            "endpointId": {
                                "Endpoint": {
                                }, 
                                "Events": {
                                    "uuid": {
                                        "Attributes": undefined, 
                                        "EventType": "_session.start", 
                                        "Metrics": undefined, 
                                        "Session": {
                                            "Id": "uuid", 
                                            "StartTimestamp": "isoString"
                                        }, 
                                        "Timestamp": "isoString"
                                    }
                                }
                            }
                        }
                    }
                });
                expect(resolve).toBeCalled();
                spyon.mockClear();
            });

            test('session start error', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback('err', null);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            
                const params = {event: { name: '_session.start', immediate: true}};
            
                await analytics.record(params, {resolve, reject});
                //expect(resolve).not.toBeCalled();
                expect(reject).toBeCalled();
                spyon.mockClear();
            });
        });

        describe('stopSession test', () => {
            test('happy case', async () => {
            const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback(null, response);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

                const params = {event: { name: '_session.stop', immediate: true}};
                await analytics.record(params, {resolve, reject});

                expect(spyon).toBeCalledWith({
                    "ApplicationId": "appId",
                    "EventsRequest": {
                        "BatchItem": {
                            "endpointId": {
                                "Endpoint": {
                                }, 
                                "Events": {
                                    "uuid": {
                                        "Attributes": undefined, 
                                        "EventType": "_session.stop", 
                                        "Metrics": undefined, 
                                        "Session": {
                                            "Duration": 0, 
                                            "Id": "uuid", 
                                            "StartTimestamp": "isoString", 
                                            "StopTimestamp": "isoString"
                                        },
                                        "Timestamp": "isoString"
                                    }
                                }
                            }
                        }
                    }
                });
                expect(resolve).toBeCalled();
                spyon.mockClear();
            });

            test('session stop error', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback('err', null);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            
                const params = {event: { name: '_session.stop', immediate: true}};
            
                await analytics.record(params, {resolve, reject});
                expect(reject).toBeCalled();
                spyon.mockClear();
            });
        });



        describe('record test', () => {
            test('custom events', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback(null, response);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

                const params = {event: { name: 'custom event', immediate: true}};
                await analytics.record(params, {resolve, reject});

                expect(spyon).toBeCalledWith({
                    "ApplicationId": "appId",
                    "EventsRequest": {
                        "BatchItem": {
                            "endpointId": {
                                "Endpoint": {
                                }, 
                                "Events": {
                                    "uuid": {
                                        "Attributes": undefined, 
                                        "EventType": "custom event", 
                                        "Metrics": undefined, 
                                        "Session": {
                                            "Id": "uuid", 
                                            "StartTimestamp": "isoString"
                                        },
                                        "Timestamp": "isoString"
                                    }
                                }
                            }
                        }
                    }
                });
                expect(resolve).toBeCalled();
                spyon.mockClear();
            });

            test('custom event error', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                    return {
                        on(event, callback) {
                            return;
                        },
                        send(callback) {
                            callback('err', null);
                        }
                    }
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            
                const params = {event: { name: 'custom event', immediate: true}};
            
                await analytics.record(params, {resolve, reject});
                expect(reject).toBeCalled();
                spyon.mockClear();
            });
        });

        describe('updateEndpoint test', () => {
            test('happy case with default client info', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(options);
                const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                    callback(null, 'data');
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

                const params = {event: { name: '_update_endpoint', immediate: true}};
                await analytics.record(params, {resolve, reject});
                expect(spyon.mock.calls[0][0]).toEqual({
                    "ApplicationId": "appId", 
                    "EndpointId": "endpointId", 
                    "EndpointRequest": {
                        "Attributes": {}, 
                        "ChannelType": undefined, 
                        "Demographic": {
                            "AppVersion": "clientInfoAppVersion", 
                            "Make": "clientInfoMake", 
                            "Model": "clientInfoModel", 
                            "ModelVersion": "clientInfoVersion", 
                            "Platform": "clientInfoPlatform"
                        }, 
                        "EffectiveDate": "isoString", 
                        "Location": {}, 
                        "Metrics": {}, 
                        "RequestId": "uuid", 
                        "User": {
                            "UserAttributes": {}, 
                            "UserId": "identityId"
                        }
                    }
                });
                expect(resolve).toBeCalled();
                spyon.mockClear();
            });

            test('happy case with client context provided', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(optionsWithClientContext);
                const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                    callback(null, 'data');
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

                const params = {event: { name: '_update_endpoint', immediate: true}};
                await analytics.record(params, {resolve, reject});
                expect(spyon.mock.calls[0][0]).toEqual({
                    "ApplicationId": "appId", 
                    "EndpointId": "endpointId", 
                    "EndpointRequest": {
                        "Attributes": {}, 
                        "ChannelType": undefined, 
                        "Demographic": {
                            "AppVersion": "clientInfoAppVersion", 
                            "Locale": "locale",
                            "Make": "make",
                            "Model": "model",
                            "ModelVersion": "clientInfoVersion", 
                            "Platform": "platform",
                            "PlatformVersion": "platformVersion",
                        }, 
                        "EffectiveDate": "isoString", 
                        "Location": {}, 
                        "Metrics": {}, 
                        "RequestId": "uuid", 
                        "User": {
                            "UserAttributes": {}, 
                            "UserId": "identityId"
                        }
                    }
                });

                spyon.mockClear();
            });
            
            test('happy case with default enpoint configure provided', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(optionsWithDefaultEndpointConfigure);
                const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                    callback(null, 'data');
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                
                const params = {event: { name: '_update_endpoint', immediate: true}};
                await analytics.record(params, {resolve, reject});
                
                expect(spyon.mock.calls[0][0]).toEqual({
                    "ApplicationId":"appId",
                    "EndpointId":"endpointId",
                    "EndpointRequest":{
                        "Address":"default",
                        "Attributes":{
                            "hobbies":[
                                "default"
                            ]
                        },
                        "ChannelType":"default",
                        "Demographic":{
                            "AppVersion":"default",
                            "Locale":"default",
                            "Make":"default",
                            "Model":"default",
                            "ModelVersion":"default",
                            "Platform":"default",
                            "PlatformVersion":"default",
                            "Timezone":"default"
                        },
                        "EffectiveDate":"isoString",
                        "Location":{
                            "City":"default",
                            "Country":"default",
                            "Latitude":0,
                            "Longitude":0,
                            "PostalCode":"default",
                            "Region":"default"
                        },
                        "Metrics":{

                        },
                        "OptOut":"default",
                        "RequestId":"uuid",
                        "User":{
                            "UserAttributes":{
                                "interests":[
                                "default"
                                ]
                            },
                            "UserId":"default"
                        }
                    }
                });

                spyon.mockClear();
            });

            test('happy case with specified enpoint configure provided', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(optionsWithDefaultEndpointConfigure);
                const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                    callback(null, 'data');
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const {UserId, UserAttributes, ...endpointRequestContext} = endpointConfigure;

                const params = {event: { name: '_update_endpoint', immediate: true, ...endpointConfigure}};
                await analytics.record(params, {resolve, reject});
                
                expect(spyon.mock.calls[0][0]).toEqual({
                    "ApplicationId":"appId",
                    "EndpointId":"endpointId",
                    "EndpointRequest":{
                        "Address":"configured",
                        "Attributes":{
                            "hobbies":[
                                "configured"
                            ]
                        },
                        "ChannelType":"configured",
                        "Demographic":{
                            "AppVersion":"configured",
                            "Locale":"configured",
                            "Make":"configured",
                            "Model":"configured",
                            "ModelVersion":"configured",
                            "Platform":"configured",
                            "PlatformVersion":"configured",
                            "Timezone":"configured"
                        },
                        "EffectiveDate":"isoString",
                        "Location":{
                            "City":"configured",
                            "Country":"configured",
                            "Latitude":0,
                            "Longitude":0,
                            "PostalCode":"configured",
                            "Region":"configured"
                        },
                        "Metrics":{

                        },
                        "OptOut":"configured",
                        "RequestId":"uuid",
                        "User":{
                            "UserAttributes":{
                                "interests":[
                                "configured"
                                ]
                            },
                            "UserId":"configured"
                        }
                    }
                });

                spyon.mockClear();
            });

            

            test('error case', async () => {
                const analytics = new AnalyticsProvider();
                analytics.configure(
                    options 
                );
                const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                    //callback('err', null);
                    callback({ message: 'error' }, null);
                });

                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            
                const params = {event: { name: '_update_endpoint', immediate: true}};
            
                await analytics.record(params, {resolve, reject});
                expect(reject).toBeCalled();
                spyon.mockClear();
            });
        });
    });
});
