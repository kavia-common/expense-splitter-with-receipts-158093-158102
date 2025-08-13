import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Bottom navigation bar with tabs for core app sections.
 * Uses NavLink to apply active styles based on the current route.
 */
// PUBLIC_INTERFACE
export default function BottomNav() {
  /** Render bottom navigation component. */
  const linkClass = ({ isActive }) =>
    'bottom-nav__link' + (isActive ? ' active' : '');

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <NavLink to="/groups" className={linkClass} aria-label="Groups">
        <span role="img" aria-hidden="true">👥</span>
        <span>Groups</span>
      </NavLink>
      <NavLink to="/expenses" className={linkClass} aria-label="Expenses">
        <span role="img" aria-hidden="true">💳</span>
        <span>Expenses</span>
      </NavLink>
      <NavLink to="/balances" className={linkClass} aria-label="Balances">
        <span role="img" aria-hidden="true">⚖️</span>
        <span>Balances</span>
      </NavLink>
      <NavLink to="/friends" className={linkClass} aria-label="Friends">
        <span role="img" aria-hidden="true">🤝</span>
        <span>Friends</span>
      </NavLink>
      <NavLink to="/receipts" className={linkClass} aria-label="Receipts">
        <span role="img" aria-hidden="true">🧾</span>
        <span>Receipts</span>
      </NavLink>
    </nav>
  );
}
