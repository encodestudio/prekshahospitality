import React from 'react';
import {
  Box, Accordion, AccordionSummary, AccordionDetails,
  Typography, List, ListItem, ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function PolicyAccordionList({ sections }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #FFD9C0',
        boxShadow: '0 12px 40px rgba(44,24,16,0.08)',
      }}
    >
      {sections.map((section, idx) => (
        <Accordion
          key={section.title}
          disableGutters
          elevation={0}
          square
          sx={{
            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FFF8F0',
            '&:before': { display: 'none' },
            '&:not(:last-child)': { borderBottom: '1px solid #FFE5CC' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B35' }} />}
            sx={{ px: { xs: 2.5, md: 3.5 }, py: 0.5 }}
          >
            <Typography sx={{ fontSize: '1.1rem', mr: 1.5 }}>{section.icon}</Typography>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: '#2C1810',
                fontSize: '1.02rem',
                fontWeight: 600,
              }}
            >
              {section.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 2.5, md: 3.5 }, pt: 0, pb: 2.5 }}>
            <List dense sx={{ py: 0 }}>
              {section.points.map((point) => (
                <ListItem key={point} sx={{ display: 'list-item', listStyleType: 'disc', ml: 3, px: 0, py: 0.4 }}>
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{ sx: { color: '#6B4226', fontSize: '0.9rem', lineHeight: 1.7 } }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
