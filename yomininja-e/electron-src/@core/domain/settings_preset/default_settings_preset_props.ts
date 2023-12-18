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
                        font_size_factor: 100
                    }
                },
                mouse: {
                    show_custom_cursor: false,
                    custom_cursor_size: 30
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
                copy_text_on_hover: false,
                copy_text_on_click: true,
                always_on_top: false,
                click_through_mode: 'auto',
                show_window_on_copy: {
                    enabled: true,
                    title: 'Yomichan Search'
                },
                always_forward_mouse_clicks: false,
                show_window_without_focus: false,
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