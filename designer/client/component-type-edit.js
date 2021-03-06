import React from "react";
import Editor from "./editor";
import { ComponentTypes } from "@xgovformbuilder/model";
import ComponentValues from "./components/component-values";
import { Textarea } from "@govuk-jsx/textarea";
import { Input } from "@govuk-jsx/input";
import Name from "./name";
import { isEmpty } from "./helpers";
import { validateTitle, validateNotEmpty } from "./validations";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

function updateComponent(component, modifier, updateModel) {
  modifier(component);
  updateModel(component);
}

function Classes(props) {
  const { component, updateModel } = props;
  component.options = component.options || {};

  return (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-label--s"
        htmlFor="field-options-classes"
      >
        Classes
      </label>
      <span className="govuk-hint">
        Additional CSS classes to add to the field
        <br />
        E.g. govuk-input--width-2 (or 3, 4, 5, 10, 20) or govuk-!-width-one-half
        (two-thirds, three-quarters etc.)
      </span>
      <input
        className="govuk-input"
        id="field-options-classes"
        name="options.classes"
        type="text"
        defaultValue={component.options.classes}
        onBlur={(e) =>
          updateComponent(
            component,
            (component) => {
              component.options.classes = e.target.value;
            },
            updateModel
          )
        }
      />
    </div>
  );
}

class FieldEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    const { component } = this.props;
    const options = component.options || {};
    this.isFileUploadField = component.type === "FileUploadField";
    this.nameRef = React.createRef();
    this.state = {
      hidden: options.required !== false,
      name: component.name,
      errors: {},
    };
  }

  validate = () => {
    const { component } = this.props;
    const nameErrors = this.nameRef.current.validate();
    const titleErrors = validateTitle("field-title", component.title);
    this.setState({
      errors: titleErrors,
    });
    return { ...nameErrors, ...titleErrors };
  };

  checkOptionalBox() {
    if (this.isFileUploadField) {
      return;
    }
    this.setState({ hidden: !this.state.hidden });
  }

  componentDidUpdate(prevProps) {
    if (this.props.component.type !== prevProps.component.type) {
      this.setState({ errors: {} });
    }
  }

  render() {
    // FIXME:- We need to refactor so this is not being driven off mutating the props.
    const { component, updateModel } = this.props;
    const { errors } = this.state;
    component.options = component.options || {};

    if (this.isFileUploadField) {
      component.options.required = false;
    }

    return (
      <div>
        <div data-test-id="standard-inputs">
          <Input
            id="field-title"
            name="title"
            label={{
              className: "govuk-label--s",
              children: ["Title"],
            }}
            hint={{
              children: ["This is the title text displayed on the page"],
            }}
            defaultValue={component.title}
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.title = e.target.value;
                },
                updateModel
              )
            }
            errorMessage={
              errors?.title ? { children: errors?.title.children } : undefined
            }
          />
          <Textarea
            id="field-hint"
            name="hint"
            rows={2}
            label={{
              className: "govuk-label--s",
              children: ["Help Text (optional)"],
            }}
            hint={{
              children: ["Text can include HTML"],
            }}
            required={false}
            value={component.hint || ""}
            onChange={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.hint = e.target.value;
                },
                updateModel
              )
            }
            {...component.attrs}
          />

          <div className="govuk-checkboxes govuk-form-group">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="field-options-hideTitle"
                name="options.hideTitle"
                type="checkbox"
                value
                checked={component.options.hideTitle || false}
                onChange={() =>
                  updateComponent(
                    component,
                    (component) => {
                      component.options.hideTitle = !component.options
                        .hideTitle;
                    },
                    updateModel
                  )
                }
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="field-options-hideTitle"
              >
                Hide title
              </label>
              <span className="govuk-hint">
                Hide the title of the component
              </span>
            </div>
          </div>

          <Name
            name={component.name}
            id="field-name"
            labelText="Component name"
            ref={this.nameRef}
            updateModel={(name) =>
              updateComponent(
                component,
                (component) => {
                  component.name = name;
                },
                updateModel
              )
            }
          />

          <div className="govuk-checkboxes govuk-form-group">
            <div className="govuk-checkboxes__item">
              <input
                type="checkbox"
                id="field-options-required"
                className={`govuk-checkboxes__input ${
                  this.isFileUploadField ? "disabled" : ""
                }`}
                name="options.required"
                checked={
                  this.isFileUploadField || component.options.required === false
                }
                onChange={(e) => {
                  updateComponent(
                    component,
                    (component) => {
                      if (this.isFileUploadField) {
                        return;
                      }
                      component.options.required =
                        component.options.required === false
                          ? undefined
                          : false;
                    },
                    updateModel
                  );
                  this.checkOptionalBox(e);
                }}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="field-options-required"
              >
                {`Make ${
                  ComponentTypes.find((type) => type.name === component.type)
                    ?.title ?? ""
                } optional`}
              </label>
              {this.isFileUploadField && (
                <span className="govuk-hint govuk-checkboxes__label">
                  All file upload fields are optional to mitigate possible
                  upload errors
                </span>
              )}
            </div>
          </div>

          <div
            className="govuk-checkboxes govuk-form-group"
            data-test-id="field-options.optionalText-wrapper"
            hidden={this.state.hidden}
          >
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="field-options-optionalText"
                name="options.optionalText"
                type="checkbox"
                checked={component.options.optionalText === false}
                onChange={(e) =>
                  updateComponent(
                    component,
                    (component) => {
                      component.options.optionalText =
                        component.options.optionalText === false
                          ? undefined
                          : false;
                    },
                    updateModel
                  )
                }
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="field-options-optionalText"
              >
                Hide &apos;(Optional)&apos; text
              </label>
            </div>
          </div>
        </div>

        {this.props.children}
      </div>
    );
  }
}

const FileUploadFieldEdit = React.forwardRef((props, ref) => {
  const { component, updateModel } = props;
  component.options = component.options || {};

  return (
    <FieldEdit component={component} updateModel={updateModel} ref={ref}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">more</span>
        </summary>

        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options.multiple"
              name="options.multiple"
              type="checkbox"
              checked={component.options.multiple === false}
              onChange={() =>
                updateComponent(
                  component,
                  (component) => {
                    component.options.multiple = !component.options.multiple;
                  },
                  updateModel
                )
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options.multiple"
            >
              Allow multiple
            </label>
          </div>
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  );
});
FileUploadFieldEdit.supportsValidation = true;

const TextFieldEdit = React.forwardRef((props, ref) => {
  const { component, updateModel } = props;
  component.schema = component.schema || {};

  return (
    <FieldEdit component={component} updateModel={updateModel} ref={ref}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">more</span>
        </summary>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-max"
          >
            Max length
          </label>
          <span className="govuk-hint">
            Specifies the maximum number of characters
          </span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-max"
            name="schema.max"
            defaultValue={component.schema.max}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.max = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-min"
          >
            Min length
          </label>
          <span className="govuk-hint">
            Specifies the minimum number of characters
          </span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-min"
            name="schema.min"
            defaultValue={component.schema.min}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.min = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-length"
          >
            Length
          </label>
          <span className="govuk-hint">Specifies the exact text length</span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-length"
            name="schema.length"
            defaultValue={component.schema.length}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.length = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-regex"
          >
            Regex
          </label>
          <span className="govuk-hint">
            Specifies a regex against which input will be validated
          </span>
          <input
            className="govuk-input"
            id="field-schema-regex"
            name="schema.regex"
            defaultValue={component.schema.regex}
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.regex = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  );
});
TextFieldEdit.supportsValidation = true;

const MultilineTextFieldEdit = React.forwardRef((props, ref) => {
  const { component, updateModel } = props;
  component.schema = component.schema || {};
  component.options = component.options || {};

  return (
    <FieldEdit component={component} updateModel={updateModel} ref={ref}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">more</span>
        </summary>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-max"
          >
            Max length
          </label>
          <span className="govuk-hint">
            Specifies the maximum number of characters
          </span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-max"
            name="schema.max"
            defaultValue={component.schema.max}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.max = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-min"
          >
            Min length
          </label>
          <span className="govuk-hint">
            Specifies the minimum number of characters
          </span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-min"
            name="schema.min"
            defaultValue={component.schema.min}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.min = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-options-rows"
          >
            Rows
          </label>
          <input
            className="govuk-input govuk-input--width-3"
            id="field-options-rows"
            name="options.rows"
            type="text"
            data-cast="number"
            defaultValue={component.options.rows}
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.options.rows = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  );
});
MultilineTextFieldEdit.supportsValidation = true;

const NumberFieldEdit = React.forwardRef((props, ref) => {
  const { component, updateModel } = props;
  component.schema = component.schema || {};

  return (
    <FieldEdit component={component} updateModel={updateModel} ref={ref}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">more</span>
        </summary>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-min"
          >
            Min
          </label>
          <span className="govuk-hint">Specifies the minimum value</span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-min"
            name="schema.min"
            defaultValue={component.schema.min}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.min = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-max"
          >
            Max
          </label>
          <span className="govuk-hint">Specifies the maximum value</span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-max"
            name="schema.max"
            defaultValue={component.schema.max}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.max = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-schema-precision"
          >
            Precision
          </label>
          <span className="govuk-hint">
            How many decimal places can users enter?
          </span>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-schema-precision"
            name="schema.precision"
            defaultValue={component.schema.precision || 0}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.schema.precision = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  );
});
NumberFieldEdit.supportsValidation = true;

const DateFieldEdit = React.forwardRef((props, ref) => {
  const { component, updateModel } = props;
  component.options = component.options || {};

  return (
    <FieldEdit component={component} updateModel={updateModel} ref={ref}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">more</span>
        </summary>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-options-maxDaysInPast"
          >
            Maximum days in the past
          </label>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-options-maxDaysInPast"
            name="options.maxDaysInPast"
            defaultValue={component.options.maxDaysInPast}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.options.maxDaysInPast = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="field-options-maxDaysInFuture"
          >
            Maximum days in the future
          </label>
          <input
            className="govuk-input govuk-input--width-3"
            data-cast="number"
            id="field-options-maxDaysInFuture"
            name="options.maxDaysInFuture"
            defaultValue={component.options.maxDaysInFuture}
            type="number"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.options.maxDaysInFuture = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  );
});
DateFieldEdit.supportsValidation = true;

class SelectFieldEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.compValuesRef = React.createRef();
    this.fieldEditorRef = React.createRef();
  }

  validate = () => {
    let fieldEditErrors = this.fieldEditorRef.current.validate();
    let componentValErrors = this.compValuesRef.current.validate();
    return { ...fieldEditErrors, ...componentValErrors };
  };

  render() {
    const { component, data, updateModel, page } = this.props;
    component.options = component.options || {};

    return (
      <FieldEdit
        component={component}
        updateModel={updateModel}
        ref={this.fieldEditorRef}
      >
        <div>
          <ComponentValues
            data={data}
            component={component}
            updateModel={updateModel}
            page={page}
            EditComponentView={ComponentTypeEdit}
            ref={this.compValuesRef}
          />

          <Classes component={component} updateModel={updateModel} />
        </div>
      </FieldEdit>
    );
  }
}

class RadiosFieldEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.compValuesRef = React.createRef();
    this.fieldEditorRef = React.createRef();
  }

  validate = () => {
    const fieldEditErrors = this.fieldEditorRef.current.validate();
    const componentValErrors = this.compValuesRef.current.validate();
    return { ...fieldEditErrors, ...componentValErrors };
  };

  render() {
    const { component, data, updateModel, page } = this.props;
    component.options = component.options || {};

    return (
      <FieldEdit
        component={component}
        updateModel={updateModel}
        ref={this.fieldEditorRef}
      >
        <ComponentValues
          data={data}
          component={component}
          updateModel={updateModel}
          page={page}
          EditComponentView={ComponentTypeEdit}
          ref={this.compValuesRef}
        />

        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-bold"
              data-cast="boolean"
              name="options.bold"
              type="checkbox"
              checked={component.options.bold === true}
              onChange={() =>
                updateComponent(
                  component,
                  (component) => {
                    component.options.bold = !component.options.bold;
                  },
                  updateModel
                )
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-bold"
            >
              Bold labels
            </label>
          </div>
        </div>
      </FieldEdit>
    );
  }
}

class CheckboxesFieldEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.compValuesRef = React.createRef();
    this.fieldEditorRef = React.createRef();
  }

  validate = () => {
    const fieldEditErrors = this.fieldEditorRef.current.validate();
    const componentValErrors = this.compValuesRef.current.validate();
    return { ...fieldEditErrors, ...componentValErrors };
  };

  render() {
    const { component, data, updateModel, page } = this.props;
    component.options = component.options || {};

    return (
      <FieldEdit
        component={component}
        updateModel={updateModel}
        ref={this.fieldEditorRef}
      >
        <ComponentValues
          data={data}
          component={component}
          updateModel={updateModel}
          page={page}
          EditComponentView={ComponentTypeEdit}
          ref={this.compValuesRef}
        />

        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-bold"
              data-cast="boolean"
              name="options.bold"
              type="checkbox"
              checked={component.options.bold === true}
              onChange={() =>
                updateComponent(
                  component,
                  (component) => {
                    component.options.bold = !component.options.bold;
                  },
                  updateModel
                )
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-bold"
            >
              Bold labels
            </label>
          </div>
        </div>
      </FieldEdit>
    );
  }
}

function ParaEdit(props) {
  const { component, data, updateModel } = props;
  component.options = component.options || {};
  const componentCondition = component.options.condition || "";
  const { conditions } = data;

  return (
    <div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="para-content">
          Content
        </label>
        <span className="govuk-hint">
          The content can include HTML and the `govuk-prose-scope` css class is
          available. Use this on a wrapping element to apply default govuk
          styles.
        </span>
        <Editor
          name="content"
          value={component.content}
          valueCallback={(content) =>
            updateComponent(
              component,
              (component) => {
                component.content = content;
              },
              updateModel
            )
          }
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="condition">
          Condition (optional)
        </label>
        <span className="govuk-hint">
          Only show this content if the condition is truthy.{" "}
        </span>
        <select
          className="govuk-select"
          id="condition"
          name="options.condition"
          value={componentCondition}
          onChange={(e) =>
            updateComponent(
              component,
              (component) => {
                component.options.condition = e.target.value;
              },
              updateModel
            )
          }
        >
          <option value="" />
          {conditions.map((condition) => (
            <option key={condition.name} value={condition.name}>
              {condition.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

class ListContentEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.compValuesRef = React.createRef();
  }

  validate = () => {
    return this.compValuesRef.current.validate();
  };

  render() {
    const { component, data, updateModel, page } = this.props;
    component.options = component.options || {};

    return (
      <div>
        <ComponentValues
          data={data}
          component={component}
          updateModel={updateModel}
          page={page}
          EditComponentView={ComponentTypeEdit}
          ref={this.compValuesRef}
        />

        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-type"
              name="options.type"
              value="numbered"
              type="checkbox"
              checked={component.options.type === "numbered"}
              onChange={() =>
                updateComponent(
                  component,
                  (component) => {
                    component.options.type =
                      component.options.type === "numbered"
                        ? undefined
                        : "numbered";
                  },
                  updateModel
                )
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-type"
            >
              Numbered
            </label>
          </div>
        </div>
      </div>
    );
  }
}

class FlashCardEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.compValuesRef = React.createRef();
  }

  validate = () => {
    return this.compValuesRef.current.validate();
  };

  render() {
    const { component, data, updateModel, page } = this.props;
    component.options = component.options || {};

    return (
      <ComponentValues
        data={data}
        component={component}
        updateModel={updateModel}
        page={page}
        EditComponentView={ComponentTypeEdit}
        ref={this.compValuesRef}
      />
    );
  }
}

const InsetTextEdit = ParaEdit;
const WarningTextEdit = ParaEdit;
const HtmlEdit = ParaEdit;

class DetailsEdit extends React.Component {
  static supportsValidation = true;

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
    };
  }

  validate = () => {
    const { component } = this.props;
    const titleError = validateNotEmpty(
      "details-title",
      "Title",
      "title",
      component.title
    );
    const contentError = validateNotEmpty(
      "details-content",
      "Content",
      "content",
      component.content
    );
    const errors = { ...titleError, ...contentError };
    this.setState({
      errors,
    });

    return errors;
  };

  render() {
    const { component, updateModel } = this.props;
    const { errors } = this.state;
    return (
      <div>
        <Input
          id="details-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: ["Title"],
          }}
          defaultValue={component.title}
          onBlur={(e) =>
            updateComponent(
              component,
              (component) => {
                component.title = e.target.value;
              },
              updateModel
            )
          }
          errorMessage={
            errors?.title ? { children: errors?.title.children } : undefined
          }
        />
        <div
          className={classNames({
            "govuk-form-group": true,
            "govuk-form-group--error": errors?.content,
          })}
        >
          <label className="govuk-label" htmlFor="details-content">
            Content
          </label>
          <span className="govuk-hint">
            The content can include HTML and the `govuk-prose-scope` css class
            is available. Use this on a wrapping element to apply default govuk
            styles.
          </span>
          {errors?.content && (
            <ErrorMessage>{errors?.content.children}</ErrorMessage>
          )}
          <textarea
            className="govuk-textarea"
            id="details-content"
            name="content"
            defaultValue={component.content}
            rows="10"
            onBlur={(e) =>
              updateComponent(
                component,
                (component) => {
                  component.content = e.target.value;
                },
                updateModel
              )
            }
          />
        </div>
      </div>
    );
  }
}

const componentTypeEditors = {
  TextFieldEdit: TextFieldEdit,
  EmailAddressFieldEdit: TextFieldEdit,
  TelephoneNumberFieldEdit: TextFieldEdit,
  NumberFieldEdit: NumberFieldEdit,
  MultilineTextFieldEdit: MultilineTextFieldEdit,
  AutocompleteFieldEdit: SelectFieldEdit,
  SelectFieldEdit: SelectFieldEdit,
  RadiosFieldEdit: RadiosFieldEdit,
  CheckboxesFieldEdit: CheckboxesFieldEdit,
  ParaEdit: ParaEdit,
  HtmlEdit: HtmlEdit,
  InsetTextEdit: InsetTextEdit,
  WarningTextEdit: WarningTextEdit,
  DetailsEdit: DetailsEdit,
  FlashCardEdit: FlashCardEdit,
  FileUploadFieldEdit: FileUploadFieldEdit,
  DatePartsFieldEdit: DateFieldEdit,
  ListEdit: ListContentEdit,
};

class ComponentTypeEdit extends React.Component {
  constructor(props) {
    super(props);
    this.typeEditorRef = React.createRef();
  }

  validate = () => {
    if (this.typeEditorRef.current) {
      const errors = this.typeEditorRef.current.validate();
      return errors;
    }
    return {};
  };

  render() {
    const { component, data, updateModel, page } = this.props;

    const type = ComponentTypes.find((t) => t.name === component.type);
    if (!type) {
      return null;
    } else {
      const TagName =
        componentTypeEditors[`${component.type}Edit`] || FieldEdit;

      if (TagName.supportsValidation) {
        return (
          <TagName
            component={component}
            data={data}
            updateModel={updateModel}
            page={page}
            ref={this.typeEditorRef}
            key={`${component.type}Edit`}
          />
        );
      } else {
        return (
          <TagName
            component={component}
            data={data}
            updateModel={updateModel}
            page={page}
            key={`${component.type}Edit`}
          />
        );
      }
    }
  }
}

export default ComponentTypeEdit;
