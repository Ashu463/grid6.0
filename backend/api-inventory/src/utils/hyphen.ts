import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  
  @ValidatorConstraint({ async: false })
  export class DoesNotEndWithHyphenConstraint implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
      return !text.endsWith('-'); // Return false if the text ends with a hyphen
    }
  
    defaultMessage(args: ValidationArguments) {
      return 'Text should not end with a hyphen!';
    }
  }
  
  export function DoesNotEndWithHyphen(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: DoesNotEndWithHyphenConstraint,
      });
    };
  }
  