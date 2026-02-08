/**
 * Bridge Implementation Tests
 *
 * Tests for ChildMfeBridge and ParentMfeBridge implementations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChildMfeBridgeImpl } from '../../../src/mfe/bridge/ChildMfeBridge';
import { ParentMfeBridgeImpl } from '../../../src/mfe/bridge/ParentMfeBridge';
import type { ActionsChain, SharedProperty } from '../../../src/mfe/types';
import type { ChainResult } from '../../../src/mfe/mediator/types';

describe('Bridge Implementation', () => {
  describe('ChildMfeBridge', () => {
    let childBridge: ChildMfeBridgeImpl;
    let parentBridge: ParentMfeBridgeImpl;

    beforeEach(() => {
      childBridge = new ChildMfeBridgeImpl(
        'test-domain',
        'gts.hai3.mfes.mfe.entry.v1~test.entry',
        'test-instance-1'
      );
      parentBridge = new ParentMfeBridgeImpl(childBridge);
      childBridge.setParentBridge(parentBridge);
    });

    it('should have correct identity properties', () => {
      expect(childBridge.domainId).toBe('test-domain');
      expect(childBridge.entryTypeId).toBe('gts.hai3.mfes.mfe.entry.v1~test.entry');
      expect(childBridge.instanceId).toBe('test-instance-1');
    });

    it('should subscribe to property updates', () => {
      const callback = vi.fn();
      const unsubscribe = childBridge.subscribeToProperty('test-prop', callback);

      const property: SharedProperty = { id: 'test-prop', value: 'test-value' };
      childBridge.receivePropertyUpdate('test-prop', property);

      expect(callback).toHaveBeenCalledWith(property);
      expect(callback).toHaveBeenCalledTimes(1);

      // Unsubscribe and verify no more calls
      unsubscribe();
      childBridge.receivePropertyUpdate('test-prop', property);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should get property synchronously', () => {
      const property: SharedProperty = { id: 'test-prop', value: 42 };
      childBridge.receivePropertyUpdate('test-prop', property);

      const result = childBridge.getProperty('test-prop');
      expect(result).toEqual(property);

      const missing = childBridge.getProperty('missing-prop');
      expect(missing).toBeUndefined();
    });

    it('should subscribe to all properties', () => {
      const callback = vi.fn();
      const unsubscribe = childBridge.subscribeToAllProperties(callback);

      const prop1: SharedProperty = { id: 'prop1', value: 'value1' };
      const prop2: SharedProperty = { id: 'prop2', value: 'value2' };

      childBridge.receivePropertyUpdate('prop1', prop1);
      childBridge.receivePropertyUpdate('prop2', prop2);

      expect(callback).toHaveBeenCalledWith('prop1', prop1);
      expect(callback).toHaveBeenCalledWith('prop2', prop2);
      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();
      childBridge.receivePropertyUpdate('prop1', prop1);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple subscribers to same property', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      childBridge.subscribeToProperty('test-prop', callback1);
      childBridge.subscribeToProperty('test-prop', callback2);

      const property: SharedProperty = { id: 'test-prop', value: 'shared' };
      childBridge.receivePropertyUpdate('test-prop', property);

      expect(callback1).toHaveBeenCalledWith(property);
      expect(callback2).toHaveBeenCalledWith(property);
    });

    it('should send actions chain to parent', async () => {
      const mockResult: ChainResult = { completed: true, path: ['test-action'] };
      const handler = vi.fn().mockResolvedValue(mockResult);
      parentBridge.onChildAction(handler);

      const chain: ActionsChain = {
        action: {
          type: 'gts.hai3.mfes.comm.action.v1~test.action',
          target: 'test-domain',
        },
      };

      const result = await childBridge.sendActionsChain(chain);

      expect(handler).toHaveBeenCalledWith(chain, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when sending actions without parent connection', async () => {
      const disconnectedBridge = new ChildMfeBridgeImpl('domain', 'entry', 'instance');
      const chain: ActionsChain = {
        action: { type: 'test', target: 'domain' },
      };

      await expect(disconnectedBridge.sendActionsChain(chain)).rejects.toThrow(
        'Bridge not connected'
      );
    });

    it('should cleanup on disposal', () => {
      const callback = vi.fn();
      childBridge.subscribeToProperty('test-prop', callback);

      const property: SharedProperty = { id: 'test-prop', value: 'value' };
      childBridge.receivePropertyUpdate('test-prop', property);
      expect(callback).toHaveBeenCalledTimes(1);

      childBridge.cleanup();

      // After cleanup, properties and subscribers should be cleared
      expect(childBridge.getProperty('test-prop')).toBeUndefined();
    });
  });

  describe('ParentMfeBridge', () => {
    let childBridge: ChildMfeBridgeImpl;
    let parentBridge: ParentMfeBridgeImpl;

    beforeEach(() => {
      childBridge = new ChildMfeBridgeImpl('domain', 'entry', 'instance');
      parentBridge = new ParentMfeBridgeImpl(childBridge);
      childBridge.setParentBridge(parentBridge);
    });

    it('should forward property updates to child', () => {
      const callback = vi.fn();
      childBridge.subscribeToProperty('test-prop', callback);

      parentBridge.receivePropertyUpdate('test-prop', 'new-value');

      expect(callback).toHaveBeenCalledWith({
        id: 'test-prop',
        value: 'new-value',
      });
    });

    it('should register and handle child actions', async () => {
      const mockResult: ChainResult = { completed: true, path: [] };
      const handler = vi.fn().mockResolvedValue(mockResult);
      parentBridge.onChildAction(handler);

      const chain: ActionsChain = {
        action: { type: 'test-action', target: 'test-target' },
      };

      const result = await parentBridge.handleChildAction(chain);

      expect(handler).toHaveBeenCalledWith(chain, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when handling action without registered handler', async () => {
      const chain: ActionsChain = {
        action: { type: 'test-action', target: 'test-target' },
      };

      await expect(parentBridge.handleChildAction(chain)).rejects.toThrow(
        'No child action handler registered'
      );
    });

    it('should dispose and cleanup', () => {
      const callback = vi.fn();
      childBridge.subscribeToProperty('test-prop', callback);

      parentBridge.dispose();

      // After disposal, property updates should be ignored
      parentBridge.receivePropertyUpdate('test-prop', 'value');
      expect(callback).not.toHaveBeenCalled();

      // Child bridge should be cleaned up
      expect(childBridge.getProperty('test-prop')).toBeUndefined();
    });

    it('should be idempotent on multiple dispose calls', () => {
      expect(() => {
        parentBridge.dispose();
        parentBridge.dispose();
        parentBridge.dispose();
      }).not.toThrow();
    });

    it('should throw error when disposed bridge is used', async () => {
      parentBridge.dispose();

      const chain: ActionsChain = {
        action: { type: 'test', target: 'target' },
      };

      await expect(parentBridge.sendActionsChain(chain)).rejects.toThrow(
        'Bridge has been disposed'
      );

      await expect(parentBridge.handleChildAction(chain)).rejects.toThrow(
        'Bridge has been disposed'
      );

      expect(() => {
        parentBridge.onChildAction(() => Promise.resolve({ completed: true, path: [] }));
      }).toThrow('Bridge has been disposed');
    });

    it('should throw error when sendActionsChain is called (not yet implemented)', async () => {
      const chain: ActionsChain = {
        action: { type: 'test-action', target: 'test-target' },
      };

      await expect(parentBridge.sendActionsChain(chain)).rejects.toThrow(
        'not yet implemented'
      );
    });
  });

  describe('Bridge Integration', () => {
    it('should maintain bidirectional communication', async () => {
      const childBridge = new ChildMfeBridgeImpl('domain', 'entry', 'instance');
      const parentBridge = new ParentMfeBridgeImpl(childBridge);
      childBridge.setParentBridge(parentBridge);

      // Setup parent handler
      const parentHandler = vi.fn().mockResolvedValue({
        completed: true,
        path: ['parent-action'],
      });
      parentBridge.onChildAction(parentHandler);

      // Child subscribes to property
      const childCallback = vi.fn();
      childBridge.subscribeToProperty('shared-prop', childCallback);

      // Parent updates property
      parentBridge.receivePropertyUpdate('shared-prop', 'parent-value');
      expect(childCallback).toHaveBeenCalledWith({
        id: 'shared-prop',
        value: 'parent-value',
      });

      // Child sends action to parent
      const chain: ActionsChain = {
        action: { type: 'child-action', target: 'domain' },
      };
      const result = await childBridge.sendActionsChain(chain);

      expect(parentHandler).toHaveBeenCalledWith(chain, undefined);
      expect(result.completed).toBe(true);
    });

    it('should handle cleanup during active subscriptions', () => {
      const childBridge = new ChildMfeBridgeImpl('domain', 'entry', 'instance');
      const parentBridge = new ParentMfeBridgeImpl(childBridge);
      childBridge.setParentBridge(parentBridge);

      const callback = vi.fn();
      childBridge.subscribeToProperty('test-prop', callback);

      // Send update
      parentBridge.receivePropertyUpdate('test-prop', 'value1');
      expect(callback).toHaveBeenCalledTimes(1);

      // Dispose parent (which cleans up child)
      parentBridge.dispose();

      // Further updates should be ignored
      parentBridge.receivePropertyUpdate('test-prop', 'value2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should track property subscribers for cleanup', () => {
      const childBridge = new ChildMfeBridgeImpl('domain', 'entry', 'instance');
      const parentBridge = new ParentMfeBridgeImpl(childBridge);
      childBridge.setParentBridge(parentBridge);

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      // Register property subscribers (simulating what bridge factory does)
      parentBridge.registerPropertySubscriber('prop1', subscriber1);
      parentBridge.registerPropertySubscriber('prop2', subscriber2);

      // Get subscribers for cleanup
      const subscribers = parentBridge.getPropertySubscribers();
      expect(subscribers.size).toBe(2);
      expect(subscribers.get('prop1')).toBe(subscriber1);
      expect(subscribers.get('prop2')).toBe(subscriber2);

      // Dispose clears subscribers
      parentBridge.dispose();
      const subscribersAfterDispose = parentBridge.getPropertySubscribers();
      expect(subscribersAfterDispose.size).toBe(0);
    });
  });
});
