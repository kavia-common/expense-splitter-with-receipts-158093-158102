import React from 'react';

/**
 * NotFound page for unmatched routes.
 */
// PUBLIC_INTERFACE
export default function NotFound() {
  /** Render a not found message. */
  return (
    <section className="section">
      <h1>404</h1>
      <div className="card">The page you are looking for was not found.</div>
    </section>
  );
}
