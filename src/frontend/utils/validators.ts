export type IValidator = (value: string, ...args: any[]) => boolean;

export const validators = {
    //  return true or false
    required: (value: string) => value !== undefined && value !== null && value !== '' && value.length > 0,
    belowMaxLength: (value: string, maxLength = 20) => value.length <= maxLength,
    aboveMinLength: (value: string, minLength = 3) => value.length >= minLength,
    isEmail: (value: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(value);
    },
    hasNoWhiteSpace: (value: string) => {
        const re = /^\S*$/;
        return re.test(value);
    },
    isAlphaNumeric: (value: string) => {
        const re = /^[a-zA-Z0-9 ]*$/g;
        return re.test(value);
    },
    hasUpperCase: (value: string) => {
        const re = /[A-Z]/;
        return re.test(value);
    },
    hasLowerCase: (value: string) => {
        const re = /[a-z]/;
        return re.test(value);
    },
    hasLetter: (value: string) => {
        const re = /[a-zA-Z]/;
        return re.test(value);
    },
    hasSpecialCharacter: (value: string) => {
        const re = /[!@#$%^&*)}[|.+=}(\]?_~`\-;:]/gm;
        return re.test(value);
    },
    hasNumber: (value: string) => {
        const re = /\d/;
        return re.test(value);
    },
    isDeviceID: (value: string) => {
        const re = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;
        return re.test(value);
    },
    /**Not as Generic but cleaner to declare here since they are validators */
    isLessThan150: (value: string) => validators.belowMaxLength(value, 150),
    isMoreThan3LessThan20: (value: string) => validators.aboveMinLength(value, 3) && validators.belowMaxLength(value, 20),
    isMoreThan8LessThan20: (value: string) => validators.aboveMinLength(value, 8) && validators.belowMaxLength(value, 20),
};
