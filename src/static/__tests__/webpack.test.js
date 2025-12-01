import makeWebpackConfig from "../webpack/makeWebpackConfig";
import staticConfig from "../__mocks__/config.development.mock";

describe("webpack", () => {
  it("should return a valid webpack config", () => {
    const myWebpackConfig = makeWebpackConfig({
      config: {
        ...staticConfig,
        stage: "prod",
      },
    });

    expect(myWebpackConfig).toBeDefined();
    expect(myWebpackConfig.mode).toBeDefined();
    expect(myWebpackConfig.entry).toBeDefined();
    expect(myWebpackConfig.output).toBeDefined();
  });

  it("should allow webpack customization via config.webpack function", () => {
    const customConfig = {
      ...staticConfig,
      stage: "prod",
      webpack: (wpConfig) => ({
        ...wpConfig,
        mode: "development",
      }),
    };

    const myWebpackConfig = makeWebpackConfig({
      config: customConfig,
    });

    expect(myWebpackConfig.mode).toBe("development");
  });

  it("should throw if unknown stage is provided", () => {
    expect(() =>
      makeWebpackConfig({
        config: {
          ...staticConfig,
          stage: "invalid-stage",
        },
      }),
    ).toThrow("Unknown webpack stage: invalid-stage");
  });
});
