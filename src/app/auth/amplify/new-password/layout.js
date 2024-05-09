'use client';

import PropTypes from 'prop-types';
import { AuthGuard } from 'src/auth/guard';
import CompactLayout from 'src/layouts/compact';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <CompactLayout>{children}</CompactLayout>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
