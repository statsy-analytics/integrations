// set environment variable
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

process.env.STATSY_API_KEY = "your_test_api_key";
