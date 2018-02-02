import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinctUntilChanged';

import { SchemaValidatorFactory } from '../schemavalidatorfactory';
import { ValidatorRegistry } from './validatorregistry';

export abstract class FormProperty {
  public schemaValidator: Function;

  protected _value: any = null;
  protected _errors: any = null;
  private _valueChanges = new BehaviorSubject<any>(null);
  private _errorsChanges = new BehaviorSubject<any>(null);
  private _visible = true;
  private _visibilityChanges = new BehaviorSubject<boolean>(true);
  private _root: PropertyGroup;
  private _parent: PropertyGroup;
  private _path: string;
  private _propertyId: string;
  private _metadata: any;

  constructor(
    schemaValidatorFactory: SchemaValidatorFactory,
    private validatorRegistry: ValidatorRegistry,
    public schema: any,
    parent: PropertyGroup,
    path: string
  ) {
    this.schemaValidator = schemaValidatorFactory.createValidatorFn(this.schema);

    this._parent = parent;
    if (parent) {
      this._root = parent.root;
    } else if (this instanceof PropertyGroup) {
      this._root = <PropertyGroup>(<any>this);
    }
    this._path = path;
    this._propertyId = this._path.substr(this._path.lastIndexOf('/') + 1);
  }

  public get valueChanges() {
    return this._valueChanges;
  }

  public get errorsChanges() {
    return this._errorsChanges;
  }

  public get type(): string {
    return this.schema.type;
  }

  public get parent(): PropertyGroup {
    return this._parent;
  }

  public get root(): PropertyGroup {
    return this._root || <PropertyGroup>(<any>this);
  }

  public get path(): string {
    return this._path;
  }

  public get value() {
    return this._value;
  }

  public get visible() {
    return this._visible;
  }

  public get valid() {
    return this._errors === null;
  }

  public get propertyId(): string {
    return this._propertyId;
  }

  public get metadata(): any {
    if (this._metadata != null) {
      return this._metadata;
    }

    if (!this._parent) {
      const fieldsets = this.root.schema.fieldsets;
      if (!fieldsets) {
        return undefined;
      }

      let metadata = fieldsets.map((x: any) => x.fieldProperties).filter((x: any) => x != null);

      if (metadata.length) {
        metadata = metadata.reduce((acc: any, arr: any) => Object.assign(acc, arr));
      }

      this._metadata = metadata;
    } else {
      const rootMeta = this.root.metadata;
      this._metadata = rootMeta[this.propertyId] != null ? rootMeta[this.propertyId] : {};
    }

    return this.metadata;
  }

  public abstract setValue(value: any, onlySelf: boolean);

  public abstract reset(value: any, onlySelf: boolean);

  public updateValueAndValidity(onlySelf = false, emitEvent = true) {
    this._updateValue();

    if (emitEvent) {
      this.valueChanges.next(this.value);
    }

    this._runValidation();

    if (this.parent && !onlySelf) {
      this.parent.updateValueAndValidity(onlySelf, emitEvent);
    }
  }

  /**
   * @internal
   */
  public abstract _hasValue(): boolean;

  /**
   *  @internal
   */
  public abstract _updateValue();

  /**
   * @internal
   */
  public _runValidation(): any {
    let errors = this.schemaValidator(this._value) || [];
    const customValidator = this.validatorRegistry.get(this.path);
    if (customValidator) {
      const customErrors = customValidator(this.value, this, this.findRoot());
      errors = this.mergeErrors(errors, customErrors);
    }
    if (errors.length === 0) {
      errors = null;
    }

    this._errors = errors;
    this.setErrors(this._errors);
  }

  private mergeErrors(errors, newErrors) {
    if (newErrors) {
      if (Array.isArray(newErrors)) {
        errors = errors.concat(...newErrors);
      } else {
        errors.push(newErrors);
      }
    }
    return errors;
  }

  private setErrors(errors) {
    this._errors = errors;
    this._errorsChanges.next(errors);
  }

  public extendErrors(errors) {
    errors = this.mergeErrors(this._errors || [], errors);
    this.setErrors(errors);
  }

  public searchProperty(path: string): FormProperty {
    let prop: FormProperty = this;
    let base: PropertyGroup = null;

    let result = null;
    if (path[0] === '/') {
      base = this.findRoot();
      result = base.getProperty(path.substr(1));
    } else {
      while (result === null && prop.parent !== null) {
        prop = base = prop.parent;
        result = base.getProperty(path);
      }
    }
    return result;
  }

  public findRoot(): PropertyGroup {
    let property: FormProperty = this;
    while (property.parent !== null) {
      property = property.parent;
    }
    return <PropertyGroup>property;
  }

  private setVisible(visible: boolean) {
    this._visible = visible;
    this._visibilityChanges.next(visible);
    this.updateValueAndValidity();
    if (this.parent) {
      this.parent.updateValueAndValidity(false, true);
    }
  }

  // A field is visible if AT LEAST ONE of the properties it depends on is visible AND has a value in the list
  public _bindVisibility() {
    const visibleIf = this.schema.visibleIf;
    if (typeof visibleIf === 'object' && Object.keys(visibleIf).length === 0) {
      this.setVisible(false);
    } else if (visibleIf !== undefined) {
      const propertiesBinding = [];
      for (const dependencyPath in visibleIf) {
        if (visibleIf.hasOwnProperty(dependencyPath)) {
          const property = this.searchProperty(dependencyPath);
          if (property) {
            const valueCheck = property.valueChanges.map(value => {
              if (visibleIf[dependencyPath].indexOf('$ANY$') !== -1) {
                return value.length > 0;
              } else {
                return visibleIf[dependencyPath].indexOf(value) !== -1;
              }
            });
            const visibilityCheck = property._visibilityChanges;
            const and = Observable.combineLatest([valueCheck, visibilityCheck], (v1, v2) => v1 && v2);
            propertiesBinding.push(and);
          } else {
            console.warn("Can't find property " + dependencyPath + ' for visibility check of ' + this.path);
          }
        }
      }

      Observable.combineLatest(propertiesBinding, (...values: boolean[]) => {
        return values.indexOf(true) !== -1;
      })
        .distinctUntilChanged()
        .subscribe(visible => {
          this.setVisible(visible);
        });
    }
  }
}

export abstract class PropertyGroup extends FormProperty {
  public properties: FormProperty[] | { [key: string]: FormProperty } = null;

  public getProperty(path: string) {
    const subPathIdx = path.indexOf('/');
    const propertyId = subPathIdx !== -1 ? path.substr(0, subPathIdx) : path;

    let property = this.properties[propertyId];
    if (property !== null && subPathIdx !== -1 && property instanceof PropertyGroup) {
      const subPath = path.substr(subPathIdx + 1);
      property = (<PropertyGroup>property).getProperty(subPath);
    }
    return property;
  }

  public forEachChild(fn: (formProperty: FormProperty, str: String) => void) {
    for (const propertyId in this.properties) {
      if (this.properties.hasOwnProperty(propertyId)) {
        const property = this.properties[propertyId];
        fn(property, propertyId);
      }
    }
  }

  public forEachChildRecursive(fn: (formProperty: FormProperty) => void) {
    this.forEachChild(child => {
      fn(child);
      if (child instanceof PropertyGroup) {
        (<PropertyGroup>child).forEachChildRecursive(fn);
      }
    });
  }

  public _bindVisibility() {
    super._bindVisibility();
    this._bindVisibilityRecursive();
  }

  public isRoot() {
    return this === this.root;
  }

  private _bindVisibilityRecursive() {
    this.forEachChildRecursive(property => {
      property._bindVisibility();
    });
  }
}
