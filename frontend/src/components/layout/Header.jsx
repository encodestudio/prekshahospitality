import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Box, Container,
  useScrollTrigger, Slide, useMediaQuery, useTheme, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Properties', to: '/properties' },
  { label: 'Rooms & Suites', to: '/rooms' },
  { label: 'Amenities', to: '/amenities' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function Header({ property }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #C04A0A, #E55A25)',
          color: '#fff',
          py: 0.5,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.9)' }}>
              🕉️ &nbsp; JAI SHRI RAM &nbsp; 🕉️
            </Typography>
            {property?.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {property.phone}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={scrolled ? 4 : 0}
          sx={{
            background: scrolled
              ? 'linear-gradient(135deg, #FF6B35 0%, #E55A25 100%)'
              : 'linear-gradient(135deg, rgba(255,107,53,0.97) 0%, rgba(229,90,37,0.97) 100%)',
            borderBottom: `1px solid rgba(255,215,0,0.3)`,
            transition: 'all 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ py: 1, px: '0 !important' }}>
              {/* Logo */}
              <Box
                component={Link}
                to="/"
                sx={{ textDecoration: 'none', flexGrow: isMobile ? 1 : 0, mr: 4 }}
              >
                <img
                  src="/logo-reference-no-background.png"
                  alt="Preksha Hospitality"
                  style={{ height: 54, width: 'auto', display: 'block' }}
                />
              </Box>

              {/* Desktop Nav */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
                  {NAV_LINKS.map((link) => (
                    <Button
                      key={link.to}
                      component={Link}
                      to={link.to}
                      sx={{
                        color: isActive(link.to) ? '#FFD700' : 'rgba(255,255,255,0.92)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                        fontWeight: isActive(link.to) ? 700 : 400,
                        px: 1.5,
                        py: 0.75,
                        textTransform: 'uppercase',
                        borderBottom: isActive(link.to)
                          ? '2px solid #FFD700'
                          : '2px solid transparent',
                        borderRadius: 0,
                        '&:hover': {
                          color: '#FFD700',
                          backgroundColor: 'rgba(255,215,0,0.1)',
                          borderBottom: '2px solid #FFD700',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Book Now CTA */}
              {!isMobile && (
                <Button
                  component={Link}
                  to="/booking"
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2, whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                >
                  Book Now
                </Button>
              )}

              {/* Mobile Menu Icon */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ color: '#FFD700' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(180deg, #FF6B35 0%, #C84A1A 100%)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            src="/logo-reference-no-background.png"
            alt="Preksha Hospitality"
            style={{ height: 44, width: 'auto' }}
          />
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.85)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,215,0,0.3)' }} />
        <List sx={{ pt: 2 }}>
          {NAV_LINKS.map((link) => (
            <ListItem
              key={link.to}
              component={Link}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: isActive(link.to) ? '#FFD700' : 'rgba(255,255,255,0.92)',
                borderLeft: isActive(link.to) ? '3px solid #FFD700' : '3px solid transparent',
                pl: 3,
                py: 1.5,
                '&:hover': { color: '#FFD700', backgroundColor: 'rgba(255,215,0,0.12)' },
              }}
            >
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{
                  fontFamily: '"Lato", sans-serif',
                  fontSize: '0.9rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              />
            </ListItem>
          ))}
          <ListItem sx={{ px: 2, pt: 3 }}>
            <Button
              component={Link}
              to="/booking"
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Book Now
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
