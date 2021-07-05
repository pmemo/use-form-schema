# React hook use-form-schema

`use-form-schema` implements React hook to handle form validation and errors messages.

## Installation

Use your package manager:

`npm i use-form-schema`

or

`yarn add use-form-schema`

## Usage

First you have to import hook:

```jsx
import useFormSchema from 'use-form-schema';
```

Next, define your form schema for validation process and create function for handling form data:

```jsx
const AppLoginForm = () => {
    const schema = {
        login: {
            required: 'Field is required',
            min: [4, 'Login must contain at least 4 characters']
        },
        password: {
            required: 'Field is required'
        }
    }
    
	const { register, errors, setErrors, isValidated } = useFormSchema(schema);
    const handleSubmit = data => {
        //...handle form data here...
        //...if you want to handle messages from your backend:
        if(req.status === 400) setErrors(err.response.data.messages);
    }
    
    return (...);
}
```

Form example:

```jsx
<form {...register(handleSubmit)}>
    <input type="text" name="login"/>
    { errors.login && <p>{errors.login[0]}</p>}

    <input type="password" name="password"/>
    { errors.password && <p>{errors.password[0]}</p>}

    <button type="submit">Log in</button>
</form>
```

If you're using form component and you can't register form:

```jsx
const {ref, onSubmit} = register(handleSubmit);

<Form onSubmit={onSubmit}>
    <div ref={ref}/>
	...
</Form>
```

This automatically bind ref to parent form element.

## Documentation

`use-form-schema` hook takes the `schema` parameter and returns `register, setErrors, reset` functions, `errors` object and `isValidated` boolean.

`const { register, errors, setErrors, isValidated, reset } = useFormSchema(schema);`

**Schema** is an object in which you define what fields you want to validate. For example:

```jsx
const schema = {
    login: {
        required: 'Field is required!'
    }
}
```

Input with name `login` can't be empty, otherwise in `errors` object an appropriate message will be added. 

To show the error message: *(use index zero to show one message)*

```jsx
{ errors.login && errors.login[0] }
```

**isValidated** tells when form was validated and sended. If you do any changes after submit, the value will be `false`. Used to show or hide messages after the current form has been submitted.

**setErrors** function sets errors for each field. The param what that function takes must be an object like:

```jsx
{
    fieldname: ['message1', 'message2'],
    otherfieldname: ['message']
}
```

Used to handle messages from API, for example if login or email are already taken.

**register** function handles all form data by adding event listeners for each field. Takes `callback` parameter and if form is valid, passes an object with data to this callback. Callback is used for handling API requests with form data.

```jsx
<form {...register(handleSubmit)}>
```

**reset** function clears errors and fields.

**NOTE! If you want to handle files add  `encType="multipart/form-data"` to form tag!**

### Validators

| Validator                                                    | Params                                  | Usage                                                        |
| ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------ |
| required                                                     | message:string                          | { required: 'Field is required!' }                           |
| min                                                          | array[value:integer, message:string]    | { min: [4, 'Field text is too short'] }                      |
| max                                                          | array[value:integer, message:string]    | { max: [12, 'Field text is too long'] }                      |
| equalField, notEqualField, ltField, lteField, gtField, gteField | array[fieldName:string, message:string] | { equalField: ['password', 'Passwords is not the same'] }    |
| equal, notEqual, lt, lte, gt, gte                            | array[value:any, message:string]        | { equal: [1000, 'Field value is not equal to 1000'] }        |
| in                                                           | array[values:array, message:string]     | { in: [['banana', 'apple'], 'Field value is not valid fruit'] } |
| notIn                                                        | array[values:array, message:string]     | { notIn: [['corn', 'leek'], 'Field value is fruit'] }        |
| regexp                                                       | array[value:regexp, message:string]     | { regexp: [/^[0-9]+/, 'Field value is not integer'] }        |
| pattern                                                      | array[value:string, message:string]     | { pattern: ['email', 'Is not valid email address'] }         |

### Validators for handling files

| Validator                                                 | Params                              | Usage                                                      |
| --------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| required                                                  | message:string                      | { required: 'Field is required!' }                         |
| ext                                                       | array[value:string, message:string] | { ext: ['png', 'File must be png' }                        |
| extAllowed                                                | array[value:string, message:string] | { extAllowed: [['png', 'jpg'], 'File is not allowed'] }    |
| extNotAllowed                                             | array[value:string, message:string] | { extNotAllowed: [['zip', 'rar'], 'File is not allowed'] } |
| sizeEqual, sizeNotEqual, sizeGt, sizeGte, sizeLt, sizeLte | array[value:any, message:string]    | { sizeLt: [2000, 'File is to big'] }                       |
| type, typeIn, typeNotIn                                   | array[value:any, message:string]    | { type: ['text/plain', 'Unknow file type'] }               |

### Custom validators

| Validator | Params                                               | Usage                                                        |
| --------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| validate  | array[value:function, params:object, message:string] | { validate: [checkPassword, { blackList }, 'Password is not allowed'] } |
| validate  | array[value:function, message:string]                | { validate: [checkPassword, 'Password is the same as login'] } |
| validator | value:function                                       | { validator: checkPassword }                                 |

Examples for custom validators:

**validate with params**

```jsx
const blackList = ['admin', 'password', 'test'];

const checkPassword = (fieldValue, params, formData) => {
    return !params.blackList.includes(fieldValue);
}

const schema = {
    login: {
      	required: 'Field is required',
    },
    password: {
        required: 'Field is required',
        validate: [checkPassword, { blackList }, 'Password is not allowed']
    }
};
```

**validate without params**

```jsx
const checkPassword = (fieldValue, formData) => {
    return !(fieldValue === formData.login);
}

const schema = {
    login: {
      	required: 'Field is required',
    },
    password: {
        required: 'Field is required',
        validate: [checkPassword, 'Password is the same as login']
    }
};
```

**validator**

```jsx
const checkPassword = (fieldValue, formData) => {
    if(fieldValue === formData.login) return 'Password is the same as login';
    if(fieldValue.length < 3) return 'Password is too short!';
}

const schema = {
    login: {
      	required: 'Field is required',
    },
    password: {
        required: 'Field is required',
        validator: checkPassword
    }
};
```

### Patterns

Pattern list for **pattern** validator:

| Pattern | Description                                          |
| ------- | ---------------------------------------------------- |
| email   | Checks if field value is valid email address         |
| number  | Check if field value is number                       |
| double  | Check if field value is double (with dot ex: 12.551) |
| integer | Check if field value is integer                      |
| alpha   | Check if field value has alphanumeric characters     |

