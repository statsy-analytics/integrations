/**
 * @jest-environment node
 */

import { trackEvent, trackPageview } from "../../src/index";

jest.mock("../../src/index", () => ({
  ...jest.requireActual("../../src/index"),
  isBrowser: jest.fn().mockReturnValue(false),
}));

beforeEach(() => {
  fetchMock.resetMocks();
});

describe("Statsy analytics", () => {
  const request = {
    url: "https://example.com",
    headers: new Headers({
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      accept: "text/html",
      "content-type": "text/html",
    }),
  };

  it("trackPageview calls fetch in server context", async () => {
    await trackPageview({ request });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("trackEvent calls fetch in server context", async () => {
    const event = {
      name: "click",
      props: { key: "value" },
      request,
    };

    await trackEvent(event);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
