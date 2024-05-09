'use client';

import { useEffect } from 'react';

import { styled } from '@mui/material/styles';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function HomeView() {
  const router = useRouter();

  useEffect(() => {
    router.push(PATH_AFTER_LOGIN);
  }, [router]);

  return null;
}
