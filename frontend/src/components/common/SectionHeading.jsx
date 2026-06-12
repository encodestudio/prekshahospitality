import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SectionHeading({ preTitle, title, subtitle, light = false, center = true }) {
  return (
    <Box sx={{ textAlign: center ? 'center' : 'left', mb: 6 }}>
      {preTitle && (
        <Typography
          component="span"
          sx={{
            display: 'inline-block',
            color: light ? 'rgba(255,255,255,0.92)' : '#FF6B35',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            mb: 1.5,
            position: 'relative',
            '&::before': center ? {
              content: '"— "',
              color: light ? '#FFD700' : '#FFD700',
            } : {},
            '&::after': center ? {
              content: '" —"',
              color: light ? '#FFD700' : '#FFD700',
            } : {},
          }}
        >
          {preTitle}
        </Typography>
      )}
      <Typography
        variant="h2"
        sx={{
          color: light ? '#FFFFFF' : '#2C1810',
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          mb: subtitle ? 2 : 0,
          position: 'relative',
          '&::after': {
            content: '""',
            display: 'block',
            width: center ? '60px' : '60px',
            height: '3px',
            background: light
              ? 'linear-gradient(90deg, rgba(255,255,255,0.7), #FFD700)'
              : 'linear-gradient(90deg, #FF6B35, #FFD700)',
            margin: center ? '16px auto 0' : '16px 0 0',
            borderRadius: '2px',
          },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          sx={{
            color: light ? 'rgba(255,255,255,0.88)' : '#6B4226',
            maxWidth: 600,
            mx: center ? 'auto' : 0,
            mt: 2,
            lineHeight: 1.8,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
