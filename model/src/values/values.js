// @flow

import type { DataModel } from '../data-model-interface'

type ValuesType = 'static' | 'listRef';
type ValueTypes = 'string' | 'number' | 'boolean';
type ConcreteValueTypes = string | number | boolean;

export interface ComponentValues {
  // Converts whatever type of values this is into a static values object
  // suitable for rendering
  toStaticValues(data: DataModel): StaticValues // eslint-disable-line
}

class Values implements ComponentValues {
  type: ValuesType
  constructor (type: ValuesType) {
    this.type = type
  }

  toStaticValues (data: DataModel): StaticValues { // eslint-disable-line
    throw Error('Unimplemented')
  }
}

class StaticValue {
  display: string;
  value: ConcreteValueTypes;
  hint: ?string;
  condition: ?string;
  children: Array<any>; // should be Array<Component> whenever someone introduces the appropriate class

  constructor (display: string, value: ConcreteValueTypes, hint: ?string, condition: ?string, children: Array<*> = []) {
    this.display = display
    this.value = value
    this.hint = hint
    this.condition = condition
    this.children = children
  }

  static from (obj: any) {
    return new StaticValue(obj.display, obj.value, obj.hint, obj.condition, obj.children)
  }
}

class StaticValues extends Values {
  valueType: ValueTypes;
  items: Array<StaticValue>;

  constructor (valueType: ValueTypes, items: Array<StaticValue>) {
    super('static')
    this.valueType = valueType
    this.items = items
  }

  toStaticValues (data: DataModel): StaticValues {
    return this
  }

  static from (obj: any): StaticValues {
    if (obj.type === 'static') {
      return new StaticValues(obj.valueType, obj.items.map(it => StaticValue.from(it)))
    }
    throw Error(`Cannot create from non static values object ${JSON.stringify(obj)}`)
  }
}

class ValueChildren {
  value: ConcreteValueTypes;
  children: Array<any>; // should be Array<Component> whenever someone introduces the appropriate class

  constructor (value: ConcreteValueTypes, children: Array<any>) {
    this.value = value
    this.children = children
  }

  static from (obj: any) {
    return new ValueChildren(obj.value, obj.children)
  }
}

class ListRefValues extends Values {
  list: string;
  valueChildren: Array<ValueChildren>;

  constructor (list: string, valueChildren: Array<ValueChildren>) {
    super('listRef')
    this.list = list
    this.valueChildren = valueChildren
  }

  toStaticValues (data: DataModel): StaticValues {
    const list = data.findList(this.list)
    if (list) {
      return new StaticValues(list.type,
        list.items.map(item =>
          new StaticValue(item.text, item.value, item.description, item.condition,
            this.valueChildren.find(it => it.value === item.value)?.children ?? [])
        )
      )
    } else {
      throw Error(`Could not find list with name ${this.list}`)
    }
  }

  toJSON () {
    return { list: this.list, valueChildren: this.valueChildren }
  }

  static from (obj: any): ListRefValues {
    if (obj.type === 'listRef') {
      return new ListRefValues(obj.list, obj.valueChildren.map(it => ValueChildren.from(it)))
    }
    throw Error(`Cannot create from non listRef values object ${JSON.stringify(obj)}`)
  }
}

const valuesFactories = {
  static: (obj) => StaticValues.from(obj),
  listRef: (obj) => ListRefValues.from(obj)
}

export function valuesFrom (obj: any): ComponentValues {
  const valuesFactory = valuesFactories[obj.type]
  if (valuesFactory) {
    return valuesFactory(obj)
  }
  throw Error(`No factory found for type ${obj.type} in object ${JSON.stringify(obj)}`)
}

export const yesNoValues = new StaticValues('boolean', [new StaticValue('Yes', true), new StaticValue('No', false)])