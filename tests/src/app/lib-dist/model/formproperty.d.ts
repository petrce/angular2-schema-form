import { BehaviorSubject } from 'rxjs';
import { SchemaValidatorFactory } from '../schemavalidatorfactory';
import { ValidatorRegistry } from './validatorregistry';
export declare abstract class FormProperty {
    private validatorRegistry;
    schema: any;
    schemaValidator: Function;
    protected _value: any;
    protected _errors: any;
    private _valueChanges;
    private _errorsChanges;
    private _visible;
    private _visibilityChanges;
    private _root;
    private _parent;
    private _path;
    private _propertyId;
    private _metadata;
    constructor(schemaValidatorFactory: SchemaValidatorFactory, validatorRegistry: ValidatorRegistry, schema: any, parent: PropertyGroup, path: string);
    readonly valueChanges: BehaviorSubject<any>;
    readonly errorsChanges: BehaviorSubject<any>;
    readonly type: string;
    readonly parent: PropertyGroup;
    readonly root: PropertyGroup;
    readonly path: string;
    readonly value: any;
    readonly visible: boolean;
    readonly valid: boolean;
    readonly propertyId: string;
    readonly metadata: any;
    abstract setValue(value: any, onlySelf: boolean): any;
    abstract reset(value: any, onlySelf: boolean): any;
    updateValueAndValidity(onlySelf?: boolean, emitEvent?: boolean): void;
    private mergeErrors(errors, newErrors);
    private setErrors(errors);
    extendErrors(errors: any): void;
    searchProperty(path: string): FormProperty;
    findRoot(): PropertyGroup;
    private setVisible(visible);
    _bindVisibility(): void;
}
export declare abstract class PropertyGroup extends FormProperty {
    properties: FormProperty[] | {
        [key: string]: FormProperty;
    };
    getProperty(path: string): any;
    forEachChild(fn: (formProperty: FormProperty, str: String) => void): void;
    forEachChildRecursive(fn: (formProperty: FormProperty) => void): void;
    _bindVisibility(): void;
    isRoot(): boolean;
    private _bindVisibilityRecursive();
}
