"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.valuesFrom = valuesFrom;
exports.yesNoValues = exports.StaticValues = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

class Index {
  constructor(type) {
    (0, _defineProperty2.default)(this, "type", void 0);
    this.type = type;
  }

  toStaticValues(data) {
    // eslint-disable-line
    throw Error('Unimplemented');
  }

}

class StaticValue {
  // should be Array<Component> whenever someone introduces the appropriate class
  constructor(label, value, hint, condition, children = []) {
    (0, _defineProperty2.default)(this, "label", void 0);
    (0, _defineProperty2.default)(this, "value", void 0);
    (0, _defineProperty2.default)(this, "hint", void 0);
    (0, _defineProperty2.default)(this, "condition", void 0);
    (0, _defineProperty2.default)(this, "children", void 0);
    this.label = label;
    this.value = value;
    this.hint = hint;
    this.condition = condition;
    this.children = children;
  }

  static from(obj) {
    return new StaticValue(obj.label, obj.value, obj.hint, obj.condition, obj.children);
  }

}

class StaticValues extends Index {
  constructor(valueType, items) {
    super('static');
    (0, _defineProperty2.default)(this, "valueType", void 0);
    (0, _defineProperty2.default)(this, "items", void 0);
    this.valueType = valueType;
    this.items = items;
  }

  toStaticValues(data) {
    return this;
  }

  static from(obj) {
    if (obj.type === 'static') {
      var _obj$items;

      return new StaticValues(obj.valueType, ((_obj$items = obj.items) !== null && _obj$items !== void 0 ? _obj$items : []).map(it => StaticValue.from(it)));
    }

    throw Error(`Cannot create from non static values object ${JSON.stringify(obj)}`);
  }

}

exports.StaticValues = StaticValues;

class ValueChildren {
  // should be Array<Component> whenever someone introduces the appropriate class
  constructor(value, children) {
    (0, _defineProperty2.default)(this, "value", void 0);
    (0, _defineProperty2.default)(this, "children", void 0);
    this.value = value;
    this.children = children;
  }

  static from(obj) {
    return new ValueChildren(obj.value, obj.children);
  }

}

class ListRefValues extends Index {
  constructor(list, valueChildren) {
    super('listRef');
    (0, _defineProperty2.default)(this, "list", void 0);
    (0, _defineProperty2.default)(this, "valueChildren", void 0);
    this.list = list;
    this.valueChildren = valueChildren;
  }

  toStaticValues(data) {
    if (this.list) {
      const list = data.findList(this.list);

      if (list) {
        return new StaticValues(list.type, list.items.map(item => {
          var _this$valueChildren$f, _this$valueChildren$f2;

          return new StaticValue(item.text, item.value, item.description, item.condition, (_this$valueChildren$f = (_this$valueChildren$f2 = this.valueChildren.find(it => it.value === item.value)) === null || _this$valueChildren$f2 === void 0 ? void 0 : _this$valueChildren$f2.children) !== null && _this$valueChildren$f !== void 0 ? _this$valueChildren$f : []);
        }));
      } else {
        throw Error(`Could not find list with name ${this.list}`);
      }
    } // just return some default values as we're not a completely defined component yet (used in the designer)


    return new StaticValues('string', []);
  }

  toJSON() {
    return {
      list: this.list,
      valueChildren: this.valueChildren
    };
  }

  static from(obj) {
    if (obj.type === 'listRef') {
      var _obj$valueChildren;

      return new ListRefValues(obj.list, ((_obj$valueChildren = obj.valueChildren) !== null && _obj$valueChildren !== void 0 ? _obj$valueChildren : []).map(it => ValueChildren.from(it)));
    }

    throw Error(`Cannot create from non listRef values object ${JSON.stringify(obj)}`);
  }

}

const valuesFactories = {
  static: obj => StaticValues.from(obj),
  listRef: obj => ListRefValues.from(obj)
};

function valuesFrom(obj) {
  const valuesFactory = valuesFactories[obj.type];

  if (valuesFactory) {
    return valuesFactory(obj);
  }

  throw Error(`No factory found for type ${obj.type} in object ${JSON.stringify(obj)}`);
}

const yesNoValues = new StaticValues('boolean', [new StaticValue('Yes', true), new StaticValue('No', false)]);
exports.yesNoValues = yesNoValues;
//# sourceMappingURL=index.js.map