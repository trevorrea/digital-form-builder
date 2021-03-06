import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { useFlyoutEffect } from "../client/flyout";
import { FlyoutContext } from "../client/context";
import sinon from "sinon";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, describe, beforeEach } = lab;

function HookWrapper(props) {
  const hook = props.hook ? props.hook() : undefined;
  return <div hook={hook} />;
}

describe("useFlyoutContext", () => {
  let increment;
  let decrement;
  beforeEach(() => {
    sinon.restore();
    increment = sinon.stub().callsFake();
    decrement = sinon.stub().callsFake();
  });

  test("Increment is called on mount", () => {
    const flyoutContextProviderValue = { count: 0, increment, decrement };
    mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: true })} />
      </FlyoutContext.Provider>
    );
    expect(increment.calledOnce).to.equal(true);
    expect(decrement.notCalled).to.equal(true);
  });

  test("Increment is not called when show is false", () => {
    //TODO:- deprecate this test when we remove reliance on show prop
    const flyoutContextProviderValue = { count: 0, increment, decrement };
    mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: false })} />
      </FlyoutContext.Provider>
    );
    expect(increment.calledOnce).to.equal(false);
  });

  test("Decrement is called on unmount", () => {
    const flyoutContextProviderValue = { count: 0, increment, decrement };
    const wrapper = mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: true })} />
      </FlyoutContext.Provider>
    );
    wrapper.unmount();
    expect(increment.calledOnce).to.equal(true);
    expect(decrement.calledOnce).to.equal(true);
  });

  test("flyout is offset by correct amount", () => {
    const flyoutContextProviderValue = { count: 1, increment, decrement };
    const wrapper = mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect()} />
      </FlyoutContext.Provider>
    );
    const { hook } = wrapper.find("div").props();
    const { style, offset } = hook;
    expect(offset).to.equal(1);
    expect(style).to.include({
      paddingLeft: "50px",
      transform: "translateX(-50px)",
      position: "relative",
    });
  });
});
