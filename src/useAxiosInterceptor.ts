// disable ts fro this file now

import React from 'react';
import { AxiosRequestHeaders } from 'axios';

import createInstance from './utils/axios';

//set content type based on config.data

function setContentType(config: any) {
  let contentType: string = '';

  switch (true) {
    case config.data instanceof FormData:
      contentType = 'multipart/form-data'; // For FormData
      break;
    case config.data instanceof URLSearchParams:
      contentType = 'application/x-www-form-urlencoded'; // For URLSearchParams
      break;
    case config.data instanceof Blob:
    case config.data instanceof ArrayBuffer:
    case config.data instanceof Uint8Array:
    case config.data instanceof ReadableStream:
    case config.data instanceof File:
    case config.data instanceof FileList:
      contentType = 'application/octet-stream'; // For binary data
      break;
    default:
      contentType = 'application/json'; // For JSON data
      break;
  }

  config.headers['Content-Type'] = contentType;
}

const axBackendInstance = createInstance('https://jsonplaceholder.typicode.com');

const useAxiosWrapper = () => {
  const testToken = () => null;
  const accessToken = 'hard coded access token';

  const reqResInterceptor = (config: any) => {
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
    } as AxiosRequestHeaders;
    setContentType(config);
    return config;
  };
  const reqErrInterceptor = async error => Promise.reject(error);

  const resResInterceptor = async response => {
    // console.log(axBe.defaults)
    return response;
  };
  const resErrInterceptor = async error => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await testToken();
        axBackendInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        // update the instance header
        return axBackendInstance(originalRequest);
      } catch (error) {
        console.error('interceptor', error);
      }
    }
    return Promise.reject(error);
  };

  React.useEffect(() => {
    const reqInterceptor = axBackendInstance.interceptors.request.use(
      reqResInterceptor,
      reqErrInterceptor
    );

    const resInterceptor = axBackendInstance.interceptors.response.use(
      resResInterceptor,
      resErrInterceptor
    );

    return () => {
      axBackendInstance.interceptors.request.eject(reqInterceptor);
      axBackendInstance.interceptors.response.eject(resInterceptor);
    };
  }, [accessToken]);

  return { axBe: axBackendInstance };
};

export default useAxiosWrapper;
