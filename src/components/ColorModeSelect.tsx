import { useThemeMode } from '../app/themeMode';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';
import { DarkMode, LightMode, SettingsBrightness } from '@mui/icons-material';
import { Box } from '@mui/material';

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

  return (
    <Select
      value={mode}
      onChange={(event: any) => {
        const value = (event.target as { value: string }).value;
        setMode(value as 'system' | 'light' | 'dark');
      }}
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
