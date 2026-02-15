/**
 * Menu Component
 *
 * Side navigation menu displaying MFE extensions with presentation metadata.
 * Uses @hai3/uikit Sidebar components for proper styling and collapsible behavior.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  useAppSelector,
  useHAI3,
  eventBus,
  HAI3_ACTION_MOUNT_EXT,
  HAI3_SCREEN_DOMAIN,
  type MenuState,
  type Extension,
} from '@hai3/react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuIcon,
  SidebarHeader,
} from '@hai3/uikit';
import { Icon } from '@iconify/react';
import { HAI3LogoIcon } from '@/app/icons/HAI3LogoIcon';
import { HAI3LogoTextIcon } from '@/app/icons/HAI3LogoTextIcon';

export interface MenuProps {
  children?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  const menuState = useAppSelector((state) => state['layout/menu'] as MenuState | undefined);
  const app = useHAI3();
  const { screensetsRegistry } = app;

  const collapsed = menuState?.collapsed ?? false;

  // Extension-driven menu state
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [mountedId, setMountedId] = useState<string | undefined>();

  useEffect(() => {
    if (!screensetsRegistry) return;

    const refresh = () => {
      const exts = screensetsRegistry.getExtensionsForDomain(HAI3_SCREEN_DOMAIN);
      const sorted = exts
        .filter(
          (ext): ext is Extension & { presentation: NonNullable<Extension['presentation']> } =>
            !!ext.presentation
        )
        .sort((a, b) => (a.presentation.order ?? 999) - (b.presentation.order ?? 999));
      setExtensions(sorted);
      setMountedId(screensetsRegistry.getMountedExtension(HAI3_SCREEN_DOMAIN));
    };

    refresh();
    const interval = setInterval(refresh, 500);
    return () => clearInterval(interval);
  }, [screensetsRegistry]);

  const handleToggleCollapse = () => {
    eventBus.emit('layout/menu/collapsed', { collapsed: !collapsed });
  };

  const handleMenuItemClick = useCallback(
    async (extensionId: string) => {
      if (!screensetsRegistry) return;
      await screensetsRegistry.executeActionsChain({
        action: {
          type: HAI3_ACTION_MOUNT_EXT,
          target: HAI3_SCREEN_DOMAIN,
          payload: { extensionId },
        },
      });
      setMountedId(extensionId);
    },
    [screensetsRegistry]
  );

  return (
    <Sidebar collapsed={collapsed}>
      {/* Logo/Brand area with collapse button */}
      <SidebarHeader
        logo={<HAI3LogoIcon />}
        logoText={!collapsed ? <HAI3LogoTextIcon /> : undefined}
        collapsed={collapsed}
        onClick={handleToggleCollapse}
      />

      {/* Menu items */}
      <SidebarContent>
        <SidebarMenu>
          {extensions.map((ext) => {
            const isActive = ext.id === mountedId;
            const pres = ext.presentation!;
            return (
              <SidebarMenuItem key={ext.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleMenuItemClick(ext.id)}
                  tooltip={collapsed ? pres.label : undefined}
                >
                  {pres.icon && (
                    <SidebarMenuIcon>
                      <Icon icon={pres.icon} className="w-4 h-4" />
                    </SidebarMenuIcon>
                  )}
                  <span>{pres.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {children}
    </Sidebar>
  );
};

Menu.displayName = 'Menu';
