import { SettingsPreset, SettingsPresetProps } from "./settings_preset";

export function getDefaultSettingsPresetProps(): SettingsPresetProps {

    return {
        name: SettingsPreset.default_name,
        overlay: {
            visuals: {
                frame: {
                    border_color: "#e21212", // Red
                    border_width: 1
                },
                ocr_item_box: {
                    background_color: '#000000', // Black
                    border_color: "#e21212", // Red
                    border_radius: 10,
                    border_width: 1,
                    text: {
                        color: "#ffffff", // White
                    }
                }
            },
            hotkeys: {
                ocr: 'Alt+S',
                copy_text: 'undefined+C',
                show: 'Alt+C',
                show_and_clear: 'Alt+V',
                ocr_on_screen_shot: true,                
            },
            behavior: {
                copy_text_on_hover: true,
                copy_text_on_click: false,
                always_on_top: false,
                click_through: true,
                show_yomichan_window_on_copy: true,
            }
        },
        ocr_engine: {
            image_scaling_factor: 1,
            max_image_width: 1600,
            cpu_threads: 8,
            invert_colors: false,
            inference_runtime: 'Open_VINO'
        },
        dictionary: {
            enabled: false,
        },

        created_at: new Date(),
        updated_at: new Date()
    }
    
}