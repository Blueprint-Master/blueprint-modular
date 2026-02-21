/**
 * BPM Layout — shell générique sidebar + topbar + body.
 * Phase 2 du BPM Framework : piloté par config (app.config.js).
 * Utilise Sidebar et DashboardHeader existants ; le parent (Dashboard) fournit
 * sidebarContent, sidebarProps, headerContent et children.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';
import '../Dashboard.css';
import './Layout.css';

const Layout = ({
  config = {},
  sidebarOpen,
  onToggleSidebar,
  sidebarContent,
  sidebarProps = {},
  headerContent,
  /** Sur mobile, contenu du header à porter en portal (ex. ErrorBoundary + DashboardHeader). Si absent, utilise headerContent. */
  headerContentPortal = null,
  isMobile = false,
  children,
  contentClassName = '',
}) => {
  const {
    logoUrl,
    profile,
    onAvatarClick,
    isConnected,
    onLogoClick,
    activePage,
    position = 'left',
    compactMenuItems,
  } = sidebarProps;

  const headerToPortal = isMobile && (headerContentPortal ?? headerContent);

  return (
    <div className="bpm-layout-wrapper dashboard-wrapper">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={onToggleSidebar}
        position={position}
        logoUrl={logoUrl}
        profile={profile}
        onAvatarClick={onAvatarClick}
        isConnected={isConnected}
        onLogoClick={onLogoClick}
        activePage={activePage}
        compactMenuItems={compactMenuItems}
      >
        {sidebarContent}
      </Sidebar>
      {headerToPortal && createPortal(headerToPortal, document.body)}
      <div
        className={`bpm-layout-main dashboard ${sidebarOpen ? 'dashboard-with-sidebar-left' : 'dashboard-with-sidebar-left-closed'}`}
      >
        {!isMobile && headerContent}
        <div className={`dashboard-page-content ${contentClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
