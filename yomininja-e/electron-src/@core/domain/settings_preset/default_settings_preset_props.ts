import { SettingsPresetInstanceProps } from "../../infra/types/entity_instance.types";
import { SettingsPreset, SettingsPresetProps,  } from "./settings_preset";

export function getDefaultSettingsPresetProps(): SettingsPresetProps {

    return {
        name: SettingsPreset.default_name,
        version: "0.6.0",
        general: {
            run_at_system_startup: 'no',
        },
        compatibility: {
            hardware_acceleration: true,
            gpu_compositing: true,
        },
        overlay: {
            visuals: {
                frame: {
                    border_color: "#e21212", // Red
                    border_width: 1
                },
                ocr_region: {
                    border_width: 1
                },
                ocr_item_box: {
                    background_color: '#000000', // Black
                    background_color_inactive: '#5b7eff00', // transparent
                    inactive_border_color: "#e21212", // Red
                    active_border_color: "#e21212", // Red
                    border_radius: 7,
                    border_width: 1,
                    size_factor: 5,
                    text: {
                        color: "#ffffff", // White
                        font_size_factor: 100,
                        font_weight: 500,
                        letter_spacing: 1,
                        letter_spacing_factor: 100,
                        outline_width: 0,
                        outline_color: '#000000',
                        character_positioning: true,
                        positioning: {
                            mode: 'line-based',
                        },
                        sentence_ending_punctuation: {
                            enabled: true,
                            hidden: true
                        },
                        furigana_filter: {
                            enabled: false,
                            threshold: 0.6
                        },
                        generated_furigana: {
                            visibility: 'visible-on-line-hover'
                        }
                    },
                    selected_text: {
                        color: '#ffffff', // White
                        background_color: '#c50b0b' // Red
                    }
                },
                mouse: {
                    show_custom_cursor: false,
                    custom_cursor_size: 30
                },
                indicators: {
                    processing_icon_color: '#c50b0b' // Red
                }
            },
            hotkeys: {
                ocr: 'Alt+S',
                copy_text: 'Alt+N',
                toggle: 'Alt+C',
                show: 'Alt+B',
                clear: 'Alt+V',
                ocr_on_screen_shot: true,
            },
            behavior: {
                copy_text_on_hover: false,
                copy_text_on_click: true,
                always_on_top: false,
                click_through_mode: 'auto',
                show_window_on_copy: {
                    enabled: false,
                    title: 'Yomichan Search'
                },
                always_forward_mouse_clicks: false,
                show_window_without_focus: false,
                hide_results_on_blur: false,
                automatic_adjustment: true,
            }
        },
        ocr_engines: [],
        dictionary: {
            enabled: false,
        },

        created_at: new Date(),
        updated_at: new Date()
    }
    
}