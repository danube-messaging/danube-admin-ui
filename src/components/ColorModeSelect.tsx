import { useThemeMode } from '../app/themeMode';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';
import { DarkMode, LightMode, SettingsBrightness } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { ChangeEvent, ReactNode } from 'react';

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useThemeMode();

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <LightMode fontSize="small" />;
      case 'dark':
        return <DarkMode fontSize="small" />;
      case 'system':
        return <SettingsBrightness fontSize="small" />;
      default:
        return <SettingsBrightness fontSize="small" />;
    }
  };

  const handleChange: SelectProps['onChange'] = (
    event:
      | ChangeEvent<HTMLInputElement>
      | (Event & { target: { value: string; name: string } }),
    _child,
  ) => {
    const value = (event.target as { value: string }).value;
    setMode(value as 'system' | 'light' | 'dark');
  };

  return (
    <Select
      value={mode}
      onChange={handleChange}
      size="small"
      startAdornment={
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          {getIcon()}
        </Box>
      }
      sx={{
        minWidth: 120,
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        },
      }}
      {...props}
    >
      <MenuItem value="system">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsBrightness fontSize="small" />
          System
        </Box>
      </MenuItem>
      <MenuItem value="light">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightMode fontSize="small" />
          Light
        </Box>
      </MenuItem>
      <MenuItem value="dark">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DarkMode fontSize="small" />
          Dark
        </Box>
      </MenuItem>
    </Select>
  );
}
