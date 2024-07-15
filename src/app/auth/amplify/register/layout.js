'use client';

import PropTypes from 'prop-types';

import { AuthGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <AuthClassicLayout title="Manage the job more effectively with Minimal">
        {children}
      </AuthClassicLayout>
      </AuthGuard>

  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
