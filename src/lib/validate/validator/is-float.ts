import { isFloat as validatorIsFloat, toFloat } from "validator";
import { Field } from "../field";
import { EValidateError, ValidateError } from "../validate";

/** Validate.isFloat options. */
export interface IIsFloat extends ValidatorJS.IsFloatOptions {}

/** Wrapper for validator isFloat. */
export function isFloat(value = "", options: IIsFloat = {}): number {
  let isValid = false;

  try {
    isValid = validatorIsFloat(value, options);
  } catch (error) {
    throw new ValidateError(EValidateError.IsFloatError, value, error);
  }

  if (!isValid) {
    throw new ValidateError(EValidateError.IsFloatError, value);
  }
  return toFloat(value);
}

export class FloatField extends Field<number> {
  public constructor(protected readonly options: IIsFloat = {}) {
    super();
  }
  public validate(value: string): number {
    return isFloat(value, this.options);
  }
}