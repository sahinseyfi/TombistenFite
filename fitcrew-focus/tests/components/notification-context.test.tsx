/** @vitest-environment jsdom */

import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { NotificationProvider, useNotificationActions, useNotificationState } from "@/components/layout/notification-context";

let container: HTMLDivElement | null = null;

afterEach(() => {
  if (container) {
    container.remove();
    container = null;
  }
});

describe("NotificationProvider", () => {
  it("propagates state updates to consumers", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    const states: number[] = [];
    let capturedActions: ReturnType<typeof useNotificationActions> | null = null;

    function Observer() {
      const { unreadCount } = useNotificationState();
      states.push(unreadCount);
      return null;
    }

    function Capture() {
      capturedActions = useNotificationActions();
      return null;
    }

    await act(async () => {
      const root = createRoot(container!);
      root.render(
        <NotificationProvider initialCount={5}>
          <Observer />
          <Capture />
        </NotificationProvider>,
      );
      await Promise.resolve();
    });

    expect(capturedActions).toBeTruthy();
    await act(async () => {
      capturedActions?.decrementUnread(2);
      await Promise.resolve();
    });

    await act(async () => {
      capturedActions?.setUnreadCount(1);
      await Promise.resolve();
    });

    expect(states).toEqual([5, 3, 1]);
  });

  it("clamps unread count to zero", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    let lastCount = -1;
    let capturedActions: ReturnType<typeof useNotificationActions> | null = null;

    function StateReader() {
      const { unreadCount } = useNotificationState();
      lastCount = unreadCount;
      return null;
    }

    function Capture() {
      capturedActions = useNotificationActions();
      return null;
    }

    await act(async () => {
      const root = createRoot(container!);
      root.render(
        <NotificationProvider initialCount={1}>
          <StateReader />
          <Capture />
        </NotificationProvider>,
      );
      await Promise.resolve();
    });

    await act(async () => {
      capturedActions?.setUnreadCount(-10);
      await Promise.resolve();
    });

    expect(lastCount).toBe(0);
  });
});
