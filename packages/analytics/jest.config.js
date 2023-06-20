/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        diagnostics: true,
        isolatedModules: true,
      },
    ],
  },
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      setupFilesAfterEnv: ["./jest.setup.server.ts"],
      testMatch: ["<rootDir>/test/server/**/*.test.ts"],
      preset: "ts-jest",
      transform: {
        "^.+\\.[tj]s$": [
          "ts-jest",
          {
            diagnostics: true,
            isolatedModules: true,
          },
        ],
      },
    },
    {
      displayName: "browser",
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["./jest.setup.browser.ts"],
      testMatch: ["<rootDir>/test/browser/**/*.test.ts"],
      preset: "ts-jest",
      transform: {
        "^.+\\.[tj]s$": [
          "ts-jest",
          {
            diagnostics: true,
            isolatedModules: true,
          },
        ],
      },
    },
  ],
};
