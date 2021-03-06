import { ErrorChain } from "../../error";
import { EValidateError, ValidateError } from "../validate";
import {
  isBoolean,
  isCountry,
  isDateTime,
  isDuration,
  isEmail,
  isFloat,
  isInteger,
  isLanguage,
  isLocale,
  isPort,
  isString,
  isTimeZone
} from "../validator";

describe("Validate", () => {
  const invalidBoolean = EValidateError[EValidateError.IsBooleanError];
  const invalidString = EValidateError[EValidateError.IsStringError];

  // Error tests.

  it("ValidateError is instance of Error and ValidateError", () => {
    const error = new ValidateError(EValidateError.IsStringError);
    expect(error instanceof ErrorChain).toEqual(true);
    expect(error instanceof ValidateError).toEqual(true);
  });

  it("ValidateError has expected properties", () => {
    const error = new ValidateError(EValidateError.IsBooleanError);
    expect(error.name).toEqual("IsBooleanError");
    expect(error.stack).toBeDefined();
    expect(error.message).toEqual(invalidBoolean);
  });

  it("ValidateError passed thrown error has format", () => {
    const error = new ValidateError(EValidateError.IsStringError, "", new Error("Unknown"));
    expect(error.name).toEqual("IsStringError");
    expect(error.stack).toBeDefined();
    expect(error.message).toEqual(`${invalidString} "": Error: Unknown`);
  });

  // Boolean tests.

  it("#isBoolean valid boolean string", () => {
    const value = isBoolean("foo");
    expect(value).toEqual(true);
  });

  it("#isBoolean invalid type throws error", (done) => {
    try {
      isBoolean(42 as any);
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  // Integer tests.

  it("#isInterger throws error for invalid input", (done) => {
    try {
      isInteger("foo");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  it("#isInteger", () => {
    expect(isInteger("-4")).toEqual(-4);
  });

  // Float tests.

  it("#isFloat throws error for invalid input", (done) => {
    try {
      isFloat("foo");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  it("#isFloat", () => {
    expect(isFloat("42.0")).toEqual(42.0);
  });

  // String tests.

  it("#isString string", () => {
    const value = isString("foo");
    expect(value).toEqual("foo");
  });

  it("#isString empty string", () => {
    const value = isString("", { min: 0 });
    expect(value).toEqual("");
  });

  it("#isString string of length", () => {
    const value = isString("escape", { max: 7 });
    expect(value).toEqual("escape");
  });

  it("#isString string in array", () => {
    const value = isString("foo", { values: ["bar", "foo"] });
    expect(value).toEqual("foo");
  });

  it("#isString invalid type as string", (done) => {
    try {
      isString(1 as any);
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  it("#isString empty string fails with default options", (done) => {
    try {
      isString("");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  it("#isString string is too long", (done) => {
    try {
      isString("foobar", { max: 3 });
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      expect(error.value).toEqual("foobar");
      done();
    }
  });

  it("#isString string not in array", (done) => {
    try {
      isString("baz", { values: ["bar", "foo"] });
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      expect(error.value).toEqual("baz");
      done();
    }
  });

  // Port tests.

  it("#isPort", () => {
    expect(isPort("3000")).toEqual(3000);
  });

  it("#isPort throws error for invalid input", (done) => {
    try {
      isPort("foo");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  it("#isPort throws error for out of range number", (done) => {
    try {
      isPort("-1");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  // Language tests.

  it("#isLanguage", () => {
    const language = isLanguage("en");
    expect(language).toEqual("en");
  });

  // Country tests.

  it("#isCountry", () => {
    const country = isCountry("GB");
    expect(country).toEqual("GB");
  });

  // Locale tests.

  it("#isLocale", () => {
    const locale = isLocale("en_GB");
    expect(locale).toEqual("en_GB");
  });

  it("#isLocale throws error for invalid input", (done) => {
    try {
      isLocale("ab_XY");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  // Time zone tests.

  it("#isTimeZone", () => {
    const timezone = isTimeZone("Europe/London");
    expect(timezone).toEqual("Europe/London");
  });

  it("#isTimeZone throws error for invalid input", (done) => {
    try {
      isTimeZone("foo/bar");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  // Date time tests.

  it("#isDateTime", () => {
    const datetime = isDateTime("2016-05-25T09:24:15.123");
    expect(datetime.isValid).toEqual(true);
  });

  it("#isDateTime throws error for invalid input", (done) => {
    try {
      isDateTime("fooTbar");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });

  // Duration tests.

  it("#isDuration", () => {
    const duration = isDuration("PT2H7M");
    expect(duration.isValid).toEqual(true);
  });

  // Email tests.

  it("#isEmail throws error for invalid input", (done) => {
    try {
      isEmail("bar");
      done.fail();
    } catch (error) {
      expect(error instanceof ValidateError).toEqual(true);
      done();
    }
  });
});
