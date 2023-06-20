/**
 * @jest-environment jsdom
 */

import { inject, trackEvent, trackPageview } from "../../src/index";

jest.mock("../../src/index", () => ({
  ...jest.requireActual("../../src/index"),
  isBrowser: jest.fn().mockReturnValue(true),
}));

describe("Statsy analytics (Browser)", () => {
  const createElementSpy = jest.spyOn(document, "createElement");
  const appendChildSpy = jest
    .spyOn(document.body, "appendChild")
    .mockImplementation(() => {});
  const statsyMock = jest.fn();

  beforeEach(() => {
    createElementSpy.mockReset();
    appendChildSpy.mockReset();
    statsyMock.mockReset();

    createElementSpy.mockImplementation((tagName) => {
      const dummyNode = document.createTextNode("");
      dummyNode.setAttribute = jest.fn();
      dummyNode.addEventListener = jest.fn((event, cb) => cb());
      dummyNode.removeEventListener = jest.fn();
      return dummyNode;
    });

    window.statsy = statsyMock;
  });

  it("inject adds a script to the DOM", () => {
    const dummyProps = {
      siteId: "testSiteId",
      trackingEndpointDomain: "test.domain",
      eventMiddleware: jest.fn(),
      autoTrackPageviews: true,
    };

    inject(dummyProps);

    // Check whether a script element has been created
    expect(createElementSpy).toHaveBeenCalledWith("script");
  });

  it('trackPageview calls the global statsy function with "pageview"', () => {
    trackPageview();

    expect(statsyMock).toHaveBeenCalledWith("pageview");
  });

  it("trackEvent calls the global statsy function with the correct parameters", () => {
    const name = "event name";
    const props = { key: "value" };

    trackEvent({ name, props });

    expect(statsyMock).toHaveBeenCalledWith(name, props);
  });

  // Additional test cases
  it("inject function sets correct script attributes", () => {
    const dummyProps = {
      siteId: "testSiteId",
      trackingEndpointDomain: "test.domain",
      eventMiddleware: jest.fn(),
      autoTrackPageviews: true,
    };

    const mockScriptElement = document.createElement("script");
    createElementSpy.mockReturnValue(mockScriptElement);

    inject(dummyProps);

    expect(mockScriptElement.src).toContain(dummyProps.trackingEndpointDomain);
    expect(mockScriptElement.src).toContain(dummyProps.siteId);
    expect(mockScriptElement.defer).toBe(true);
  });
});
