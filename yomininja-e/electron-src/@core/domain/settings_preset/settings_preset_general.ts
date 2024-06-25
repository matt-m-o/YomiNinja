
export type RunAtSystemStartupOptions = 'minimized' | 'yes' | 'no';

export type GeneralSettings = {
    run_at_system_startup: RunAtSystemStartupOptions;
    hardware_acceleration: boolean;
};