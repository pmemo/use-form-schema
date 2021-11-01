import { useCallback, useEffect, useRef, useState } from "react";

export default function useFormSchema(schema) {
    const ref = useRef();
    const [isValidated, setIsValidated] = useState(false);
    const [errors, setErrors] = useState({});

    const checkConstraint = useCallback((constraintName, fieldValue, constraintParams, data) => {
        if (fieldValue.name !== undefined) {
            // Handle file type inputs
            switch (constraintName) {
                case 'required':
                    return !!fieldValue.name;
                case 'ext':
                    return fieldValue.name.split('.').pop() === constraintParams[0];
                case 'extAllowed':
                    return constraintParams[0].includes(fieldValue.name.split('.').pop());
                case 'extNotAllowed':
                    return !constraintParams[0].includes(fieldValue.name.split('.').pop());
                case 'sizeEqual':
                    return fieldValue.size === constraintParams[0];
                case 'sizeNotEqual':
                    return fieldValue.size !== constraintParams[0];
                case 'sizeGt':
                    return fieldValue.size > constraintParams[0];
                case 'sizeGte':
                    return fieldValue.size >= constraintParams[0];
                case 'sizeLt':
                    return fieldValue.size < constraintParams[0];
                case 'sizeLte':
                    return fieldValue.size <= constraintParams[0];
                case 'type':
                    return fieldValue.type === constraintParams[0];
                case 'typeIn':
                    return constraintParams[0].includes(fieldValue.type);
                case 'typeNotIn':
                    return !constraintParams[0].includes(fieldValue.type);
                case 'validator':
                    return constraintParams(fieldValue, data);
                case 'validate':
                    if (constraintParams.length === 3) {
                        return constraintParams[0](fieldValue, constraintParams[1], data);
                    } else {
                        return constraintParams[0](fieldValue, data);
                    }
                default:
                    return new Error();
            }
        } else {
            // handle others types
            switch (constraintName) {
                case 'required':
                    return !!fieldValue;
                case 'min':
                    return fieldValue.length >= constraintParams[0];
                case 'max':
                    return fieldValue.length <= constraintParams[0];
                case 'equalField':
                    return fieldValue === data[constraintParams[0]];
                case 'notEqualField':
                    return fieldValue !== data[constraintParams[0]];
                case 'equal':
                    return fieldValue === constraintParams[0];
                case 'notEqual':
                    return fieldValue !== constraintParams[0];
                case 'gt':
                    return fieldValue > constraintParams[0];
                case 'gte':
                    return fieldValue >= constraintParams[0];
                case 'lt':
                    return fieldValue < constraintParams[0];
                case 'lte':
                    return fieldValue <= constraintParams[0];
                case 'gtField':
                    return fieldValue > data[constraintParams[0]];
                case 'gteField':
                    return fieldValue >= data[constraintParams[0]];
                case 'ltField':
                    return fieldValue < data[constraintParams[0]];
                case 'lteField':
                    return fieldValue <= data[constraintParams[0]];
                case 'in':
                    return constraintParams[0].includes(fieldValue);
                case 'notIn':
                    return !constraintParams[0].includes(fieldValue);
                case 'pattern':
                    const patterns = {
                        email: /^\S+@\S+\.\S+$/,
                        number: /-?\\d*(\\.\\d+)?$/,
                        double: /^[0-9]+.[0-9]+$/,
                        integer: /^[0-9]+/,
                        alpha: /^[^`~\-!@#$%^&*()_+={}[\]|\\:;“’<,>.?๐฿]*$/
                    }
                    if (patterns[constraintParams[0]]) {
                        if (fieldValue.length === 0) return true;
                        return patterns[constraintParams[0]].test(fieldValue);
                    } else {
                        return false;
                    }
                case 'regexp':
                    return constraintParams[0].test(fieldValue);
                case 'validator':
                    return constraintParams(fieldValue, data);
                case 'validate':
                    if (constraintParams.length === 3) {
                        return constraintParams[0](fieldValue, constraintParams[1], data);
                    } else {
                        return constraintParams[0](fieldValue, data);
                    }
                default:
                    return new Error();
            }
        }
    }, []);

    const checkConstraints = useCallback((fieldName, constraints, data) => {
        if (data[fieldName] === '' && !(Object.keys(constraints).includes('required'))) return null;
        const errors = {};
        for (const [constraintName, constraintParams] of Object.entries(constraints)) {
            const isValidated = checkConstraint(constraintName, data[fieldName], constraintParams, data);
            let message;
            if (constraintName !== 'validator' && !isValidated) {
                message = Array.isArray(constraintParams) ? constraintParams[constraintParams.length - 1] : constraintParams;
            } else if (isValidated && constraintName === 'validator') {
                message = isValidated;
            }

            if (message) {
                if (errors[fieldName]) {
                    errors[fieldName].push(message);
                } else {
                    errors[fieldName] = [message];
                }
            }
        }

        return errors;
    }, [checkConstraint]);

    const validateField = useCallback((fieldName, data) => {
        let errors = {};
        if (schema[fieldName]) {
            errors = checkConstraints(fieldName, schema[fieldName], data);
        }

        return errors;
    }, [schema, checkConstraints]);

    const validateForm = useCallback(data => {
        let errors = {};
        for (const [fieldName, constraints] of Object.entries(schema)) {
            errors = { ...errors, ...checkConstraints(fieldName, constraints, data) };
        }

        return errors;
    }, [schema, checkConstraints]);

    const onFieldUpdate = useCallback(e => {
        const formData = new FormData(ref.current);
        const formDataObj = Object.fromEntries(formData);
        const err = validateField(e.target.name, formDataObj);
        const errs = errors;
        delete errs[e.target.name];

        setErrors({ ...errs, ...err });
    }, [errors, validateField]);

    useEffect(() => {
		if (!ref.current) return;
		
        const form = ref.current instanceof HTMLElement
            && ref.current.tagName === 'FORM' ? ref.current : ref.current = ref.current.parentElement;

        if (!(form instanceof HTMLElement) || form.tagName !== 'FORM') throw new Error('Cannot register form');
        const fields = form.querySelectorAll('input, textarea, select');
        for (const field of fields) {
            field.addEventListener('change', onFieldUpdate, true);
            field.addEventListener('keydown', () => setIsValidated(false), true);
        }

        form.addEventListener('reset', () => {
            setErrors({});
            setIsValidated(false);
        });

        return (() => {
            for (const field of fields) {
                field.removeEventListener('change', onFieldUpdate, true);
                field.removeEventListener('keydown', () => setIsValidated(false), true);
            }

            form.removeEventListener('reset', () => {
                setErrors({});
                setIsValidated(false);
            });
        });
    }, [ref, onFieldUpdate]);

    const reset = useCallback(() => {
        ref.current.reset();
    }, []);

    const handleSubmit = useCallback((e, callback) => {
        if (Object.keys(e).length > 0) e.preventDefault();

        const formData = new FormData(ref.current);
        const formDataObj = Object.fromEntries(formData);

        const err = validateForm(formDataObj);
        const isErrorsOccured = err && Object.keys(err).length === 0;

        if (isErrorsOccured) callback(formDataObj);
        setIsValidated(!!isErrorsOccured);
        setErrors(err);
    }, [validateForm]);

    const register = useCallback((callback) => {
        return { onSubmit: e => handleSubmit(e, callback), ref };
    }, [handleSubmit]);

    return { register, errors, setErrors, isValidated, reset };
}