/**
 * Material Icons Library
 * Provides a list of available Material Icons for use in the admin interface
 */

// Define the icon categories for filtering
window.iconCategories = [
    { id: 'all', name: 'Alle Icons' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'actions', name: 'Aktionen' },
    { id: 'content', name: 'Inhalt' },
    { id: 'communication', name: 'Kommunikation' },
    { id: 'alerts', name: 'Hinweise' },
    { id: 'av', name: 'Audio & Video' },
    { id: 'device', name: 'Geräte' },
    { id: 'ux', name: 'UI & UX' },
    { id: 'design', name: 'Design' },
    { id: 'web', name: 'Web' },
    { id: 'data', name: 'Daten & Analytik' },
    { id: 'business', name: 'Business' },
    { id: 'editor', name: 'Formatierung' },
    { id: 'maps', name: 'Karten & Orte' },
    { id: 'accessibility', name: 'Barrierefreiheit' },
    { id: 'social', name: 'Social Media' }
];

// Combine all icons into a flat array
window.materialIcons = [];

// Define the global material icons array with categorization
window.materialIconsByCategory = {
    // Navigation Icons
    'navigation': [
        'arrow_back', 'arrow_forward', 'arrow_upward', 'arrow_downward',
        'menu', 'close', 'check', 'expand_more', 'expand_less',
        'home', 'search', 'settings', 'help', 'info', 'apps', 'account_circle',
        'navigate_before', 'navigate_next', 'more_vert', 'more_horiz',
        'refresh', 'unfold_more', 'unfold_less', 'fullscreen', 'fullscreen_exit',
        'first_page', 'last_page', 'navigation', 'subdirectory_arrow_right',
        'subdirectory_arrow_left', 'double_arrow', 'login', 'logout', 'tab'
    ],
    
    // Action Icons
    'actions': [
        'delete', 'add', 'remove', 'edit', 'save', 'done', 'redo', 'undo',
        'favorite', 'bookmark', 'star', 'thumb_up', 'thumb_down', 'thumbs_up_down',
        'visibility', 'visibility_off', 'lock', 'lock_open', 'share',
        'block', 'shopping_cart', 'download', 'upload', 'copy', 'paste',
        'assignment', 'assignment_turned_in', 'assignment_late', 'assignment_return',
        'backup', 'cached', 'check_circle', 'delete_forever', 'done_all',
        'eject', 'euro_symbol', 'event', 'exit_to_app', 'explore',
        'extension', 'face', 'favorite_border', 'find_in_page', 'find_replace',
        'flip_to_back', 'flip_to_front', 'g_translate', 'gavel', 'get_app',
        'grade', 'group_work', 'highlight_off', 'history', 'home',
        'hourglass_empty', 'hourglass_full', 'https', 'input', 'invert_colors',
        'label', 'label_off', 'language', 'launch', 'line_style', 'line_weight',
        'list', 'lock_outline', 'loyalty', 'markunread_mailbox', 'note_add',
        'offline_pin', 'opacity', 'open_in_browser', 'open_in_new', 'open_with',
        'pageview', 'pan_tool', 'payment', 'perm_camera_mic', 'perm_identity'
    ],
    
    // Content Icons
    'content': [
        'send', 'archive', 'mail', 'report', 'flag', 'create', 'link',
        'content_copy', 'content_cut', 'content_paste', 'filter_list', 'sort',
        'print', 'attach_file', 'cloud', 'cloud_upload', 'cloud_download',
        'add_circle', 'add_circle_outline', 'remove_circle', 'remove_circle_outline',
        'block', 'clear', 'backspace', 'flag', 'font_download', 'forward',
        'gesture', 'inbox', 'link_off', 'low_priority', 'next_week',
        'outlined_flag', 'redo', 'remove_shopping_cart', 'reply', 'reply_all',
        'report_off', 'save_alt', 'select_all', 'send', 'sort_by_alpha',
        'text_format', 'unarchive', 'undo', 'waves', 'weekend', 'where_to_vote',
        'add_box', 'add_link', 'inventory', 'inventory_2', 'biotech',
        'segment', 'copy_all', 'file_download', 'file_download_done',
        'file_download_off', 'file_upload', 'drive_file_move', 'drive_file_rename_outline',
        'note_add', 'playlist_add', 'playlist_add_check', 'playlist_play', 'stacked_bar_chart'
    ],
    
    // Communication Icons
    'communication': [
        'chat', 'email', 'call', 'message', 'forum', 'phone', 'phone_android',
        'contact_mail', 'contacts', 'person', 'people', 'group', 'groups',
        'alternate_email', 'business', 'call_end', 'call_made', 'call_merge',
        'call_missed', 'call_received', 'call_split', 'canceled_schedule_send',
        'cell_wifi', 'chat_bubble', 'chat_bubble_outline', 'clear_all',
        'comment', 'contact_phone', 'contacts', 'dialer_sip', 'dialpad',
        'domain_disabled', 'duo', 'email', 'forum', 'import_contacts',
        'import_export', 'invert_colors_off', 'list_alt', 'live_help',
        'location_off', 'location_on', 'mail_outline', 'message', 'mobile_screen_share',
        'no_sim', 'phone_forwarded', 'phone_in_talk', 'phone_locked',
        'phone_missed', 'phone_paused', 'portable_wifi_off', 'present_to_all',
        'print_disabled', 'ring_volume', 'rss_feed', 'screen_share',
        'sentiment_satisfied_alt', 'speaker_phone', 'stay_current_landscape',
        'stay_current_portrait', 'stay_primary_landscape', 'stay_primary_portrait',
        'stop_screen_share', 'swap_calls', 'textsms', 'unsubscribe', 'voicemail',
        'vpn_key', 'wifi_calling', 'contactless'
    ],
    
    // Alert Icons
    'alerts': [
        'error', 'warning', 'info', 'help_outline', 'notification_important',
        'add_alert', 'error_outline', 'notification_important', 'notifications',
        'notifications_active', 'notifications_none', 'notifications_off',
        'notifications_paused', 'error', 'auto_delete', 'error', 'feedback',
        'report', 'report_problem', 'warning', 'campaign', 'priority_high',
        'sms_failed', 'sync_problem', 'gpp_bad', 'gpp_good', 'gpp_maybe'
    ],
    
    // AV Icons
    'av': [
        'play_arrow', 'pause', 'stop', 'volume_up', 'volume_off', 'volume_mute',
        'fast_forward', 'fast_rewind', 'playlist_play', 'mic', 'videocam',
        'album', 'av_timer', 'closed_caption', 'equalizer', 'explicit',
        'fiber_manual_record', 'fiber_new', 'fiber_pin', 'fiber_smart_record',
        'forward_10', 'forward_30', 'forward_5', 'games', 'hd', 'hearing',
        'high_quality', 'library_books', 'library_music', 'loop', 'mic_none',
        'mic_off', 'movie', 'music_video', 'new_releases', 'not_interested',
        'note', 'pause_circle_filled', 'pause_circle_outline', 'play_circle_filled',
        'play_circle_outline', 'playlist_add', 'playlist_add_check', 'queue',
        'queue_music', 'radio', 'recent_actors', 'remove_from_queue', 'repeat',
        'repeat_one', 'replay', 'replay_10', 'replay_30', 'replay_5',
        'shuffle', 'skip_next', 'skip_previous', 'slow_motion_video', 'snooze',
        'sort_by_alpha', 'speed', 'stop_circle', 'subscriptions', 'subtitles',
        'surround_sound', 'video_call', 'video_label', 'video_library', 'videocam_off',
        'volume_down', 'volume_mute', 'web', 'web_asset'
    ],
    
    // Device Icons
    'device': [
        'smartphone', 'tablet', 'laptop', 'desktop_windows', 'tv', 'monitor',
        'keyboard', 'mouse', 'battery_full', 'wifi', 'bluetooth', 'devices',
        'access_alarm', 'access_alarms', 'access_time', 'add_alarm', 'airplanemode_active',
        'airplanemode_inactive', 'battery_20', 'battery_30', 'battery_50',
        'battery_60', 'battery_80', 'battery_90', 'battery_alert', 'battery_charging_20',
        'battery_charging_30', 'battery_charging_50', 'battery_charging_60',
        'battery_charging_80', 'battery_charging_90', 'battery_charging_full',
        'battery_full', 'battery_std', 'battery_unknown', 'bluetooth_connected',
        'bluetooth_disabled', 'bluetooth_searching', 'brightness_auto', 'brightness_high',
        'brightness_low', 'brightness_medium', 'data_usage', 'developer_mode',
        'devices_other', 'dvr', 'gps_fixed', 'gps_not_fixed', 'gps_off',
        'location_disabled', 'location_searching', 'multitrack_audio', 'network_cell',
        'network_wifi', 'nfc', 'screen_lock_landscape', 'screen_lock_portrait',
        'screen_lock_rotation', 'screen_rotation', 'sd_storage', 'settings_system_daydream',
        'signal_cellular_0_bar', 'signal_cellular_1_bar', 'signal_cellular_2_bar',
        'signal_cellular_3_bar', 'signal_cellular_4_bar', 'signal_cellular_connected_no_internet_0_bar',
        'signal_cellular_no_sim', 'signal_cellular_null', 'signal_cellular_off',
        'signal_wifi_0_bar', 'signal_wifi_1_bar', 'signal_wifi_1_bar_lock',
        'signal_wifi_2_bar', 'signal_wifi_2_bar_lock', 'signal_wifi_3_bar',
        'signal_wifi_3_bar_lock', 'signal_wifi_4_bar', 'signal_wifi_4_bar_lock',
        'signal_wifi_off', 'storage', 'usb', 'wallpaper', 'widgets',
        'wifi_lock', 'wifi_tethering'
    ],
    
    // UI & UX Icons
    'ux': [
        'accessibility', 'accessible', 'account_circle', 'dashboard', 'face',
        'feedback', 'build', 'code', 'bug_report', 'extension', 'psychology',
        '3d_rotation', 'ac_unit', 'airline_seat_flat', 'airline_seat_flat_angled',
        'airline_seat_individual_suite', 'airline_seat_legroom_extra', 'airline_seat_legroom_normal',
        'airline_seat_legroom_reduced', 'airline_seat_recline_extra', 'airline_seat_recline_normal',
        'bluetooth_audio', 'confirmation_number', 'disc_full', 'drive_eta',
        'enhanced_encryption', 'event_available', 'event_busy', 'event_note',
        'folder_special', 'live_tv', 'mms', 'more', 'network_check',
        'network_locked', 'no_encryption', 'ondemand_video', 'personal_video',
        'phone_bluetooth_speaker', 'phone_callback', 'phone_forwarded', 'phone_in_talk',
        'phone_locked', 'phone_missed', 'phone_paused', 'power', 'power_input',
        'sd_card', 'sim_card', 'sms', 'sms_failed', 'sync',
        'sync_disabled', 'sync_problem', 'system_update', 'tap_and_play', 'time_to_leave',
        'vibration', 'voice_chat', 'vpn_lock', 'wc', 'wifi', 'ad_units',
        'design_services', 'disabled_by_default', 'mobile_friendly', 'mobile_off',
        'wysiwyg', 'attachment', 'comment_bank', 'drive_file_move_outline',
        'page_view', 'stacked_line_chart', 'text_snippet', 'topic',
        'filter_alt', 'notification_add'
    ],
    
    // Design & Development Icons
    'design': [
        'palette', 'color_lens', 'brush', 'format_paint', 'style',
        'straighten', 'crop', 'layers', 'widgets', 'grid_on',
        'add_box', 'add_circle', 'add_circle_outline', 'archive', 'attribution',
        'backspace', 'ballot', 'block', 'calculate', 'camera_enhance',
        'cancel', 'card_giftcard', 'card_membership', 'card_travel', 'change_history',
        'check_box', 'check_box_outline_blank', 'chrome_reader_mode', 'class',
        'code', 'commute', 'compare_arrows', 'contact_support', 'copyright',
        'credit_card', 'dashboard', 'date_range', 'delete_outline', 'description',
        'dns', 'done_outline', 'drag_indicator', 'eco', 'euro',
        'event', 'event_seat', 'explore', 'explore_off', 'extension',
        'face', 'favorite', 'favorite_border', 'feedback', 'fingerprint',
        'flight_takeoff', 'format_paint', 'format_shapes', 'free_breakfast', 'emoji_events',
        'emoji_flags', 'emoji_food_beverage', 'emoji_nature', 'emoji_objects',
        'emoji_people', 'emoji_symbols', 'emoji_transportation', 'engineering',
        'gavel', 'grain', 'graphic_eq', 'grid_view', 'group_add',
        'group_work', 'hardware', 'home_work', 'highlight_alt', 'history_edu',
        'history_toggle_off', 'horizontal_split', 'hourglass_bottom', 'hourglass_disabled',
        'hourglass_empty', 'hourglass_full', 'hourglass_top', 'http', 'https'
    ],
    
    // Web Development Icons
    'web': [
        'language', 'public', 'vpn_lock', 'security', 'http',
        'developer_mode', 'devices', 'dns', 'storage', 'memory',
        'cloud', 'cloud_circle', 'cloud_done', 'cloud_download', 'cloud_off',
        'cloud_queue', 'cloud_upload', 'backup', 'backup_table', 'browser_not_supported',
        'chrome_reader_mode', 'code', 'computer', 'desktop_access_disabled',
        'desktop_mac', 'desktop_windows', 'developer_board', 'developer_board_off', 'device_hub',
        'device_unknown', 'devices_other', 'dock', 'earbuds', 'earbuds_battery',
        'headphones', 'headphones_battery', 'headset', 'headset_mic', 'headset_off',
        'home_max', 'home_mini', 'keyboard', 'keyboard_alt', 'keyboard_arrow_down',
        'keyboard_arrow_left', 'keyboard_arrow_right', 'keyboard_arrow_up', 'keyboard_backspace',
        'keyboard_capslock', 'keyboard_hide', 'keyboard_return', 'keyboard_tab',
        'keyboard_voice', 'laptop', 'laptop_chromebook', 'laptop_mac', 'laptop_windows',
        'memory', 'mouse', 'phone_android', 'phone_iphone', 'phonelink',
        'phonelink_off', 'point_of_sale', 'power_input', 'router', 'scanner',
        'security', 'sim_card', 'smartphone', 'speaker', 'speaker_group',
        'tablet', 'tablet_android', 'tablet_mac', 'toys', 'tv', 'api'
    ],
    
    // Data & Analytics
    'data': [
        'pie_chart', 'bar_chart', 'scatter_plot', 'analytics', 'insights',
        'trending_up', 'trending_down', 'trending_flat', 'timeline', 'multiline_chart',
        'show_chart', 'assessment', 'poll', 'table_chart', 'stacked_bar_chart',
        'bubble_chart', 'score', 'leaderboard', 'data_usage', 'donut_large',
        'donut_small', 'pie_chart_outlined', 'waterfall_chart', 'stacked_line_chart',
        'chart_data', 'ssid_chart', 'schema', 'funnel_chart', 'monitoring',
        'query_stats', 'bar_chart_4_bars', 'draw', 'model_training', 'lab_profile',
        'horizontal_distribute', 'vertical_distribute', 'vertical_align_bottom',
        'vertical_align_center', 'vertical_align_top', 'data_array', 'data_object',
        'database', 'data_exploration', 'data_thresholding', 'filter_alt',
        'auto_graph', 'monochrome_photos', 'pie_chart_outline', 'analytics'
    ],
    
    // Business & Commerce
    'business': [
        'shopping_cart', 'storefront', 'receipt', 'payments', 'credit_card',
        'account_balance', 'work', 'business', 'handshake', 'verified',
        'monetization_on', 'money', 'account_balance_wallet', 'approval',
        'all_inbox', 'atm', 'attach_money', 'business_center', 'contact_mail',
        'contacts', 'contact_page', 'contact_phone', 'domain', 'domain_add',
        'domain_disabled', 'domain_verification', 'email', 'euro_symbol',
        'event_seat', 'flight', 'hotel', 'inventory', 'loyalty',
        'markunread_mailbox', 'meeting_room', 'money_off', 'money_off_csred',
        'point_of_sale', 'redeem', 'request_page', 'store', 'store_mall_directory',
        'work', 'work_off', 'work_outline', 'factory', 'corporate_fare',
        'local_atm', 'local_cafe', 'local_convenience_store', 'local_dining',
        'local_fire_department', 'local_gas_station', 'local_grocery_store',
        'local_hospital', 'local_hotel', 'local_laundry_service', 'local_library',
        'local_mall', 'local_movies', 'local_offer', 'local_parking',
        'local_pharmacy', 'local_phone', 'local_pizza', 'local_play',
        'local_post_office', 'local_print_shop', 'local_restaurant', 'local_shipping',
        'local_taxi', 'map', 'money', 'my_location', 'navigation',
        'near_me', 'person_pin', 'person_pin_circle', 'restaurant_menu'
    ],
    
    // Editor & Text Formatting
    'editor': [
        'format_align_center', 'format_align_left', 'format_align_right',
        'format_bold', 'format_italic', 'format_list_bulleted', 'format_list_numbered',
        'format_color_fill', 'format_color_reset', 'format_color_text', 'format_indent_decrease',
        'format_indent_increase', 'format_line_spacing', 'format_paint', 'format_quote',
        'format_shapes', 'format_size', 'format_strikethrough', 'format_textdirection_l_to_r',
        'format_textdirection_r_to_l', 'format_underlined', 'functions', 'highlight',
        'insert_chart', 'insert_chart_outlined', 'insert_comment', 'insert_drive_file',
        'insert_emoticon', 'insert_invitation', 'insert_link', 'insert_photo',
        'linear_scale', 'merge_type', 'mode_comment', 'mode_edit',
        'monetization_on', 'money_off', 'multiline_chart', 'notes',
        'pie_chart', 'publish', 'short_text', 'show_chart',
        'space_bar', 'strikethrough_s', 'table_chart', 'text_fields',
        'title', 'vertical_align_bottom', 'vertical_align_center', 'vertical_align_top',
        'wrap_text', 'attach_file', 'attach_money', 'border_all',
        'border_bottom', 'border_clear', 'border_horizontal', 'border_inner',
        'border_left', 'border_outer', 'border_right', 'border_style',
        'border_top', 'border_vertical', 'drag_handle', 'grid_on',
        'link', 'link_off', 'note_add', 'post_add', 'space_bar'
    ],
    
    // Maps & Location
    'maps': [
        'map', 'place', 'directions', 'navigation', 'my_location',
        'location_on', 'location_off', 'add_location', 'edit_location',
        'near_me', 'person_pin', 'person_pin_circle', 'pin_drop',
        'streetview', 'traffic', 'add_location_alt', 'beenhere',
        'directions_bike', 'directions_boat', 'directions_bus', 'directions_car',
        'directions_railway', 'directions_run', 'directions_subway', 'directions_transit',
        'directions_walk', 'edit_attributes', 'edit_location_alt', 'edit_road',
        'electric_bike', 'electric_car', 'electric_moped', 'electric_rickshaw',
        'electric_scooter', 'flight', 'hotel', 'layers',
        'layers_clear', 'local_activity', 'local_airport', 'local_atm',
        'local_bar', 'local_cafe', 'local_car_wash', 'local_convenience_store',
        'local_dining', 'local_drink', 'local_florist', 'local_gas_station',
        'local_grocery_store', 'local_hospital', 'local_hotel', 'local_laundry_service',
        'local_library', 'local_mall', 'local_movies', 'local_offer',
        'local_parking', 'local_pharmacy', 'local_phone', 'local_pizza',
        'local_play', 'local_post_office', 'local_printshop', 'local_see',
        'local_shipping', 'local_taxi', 'alt_route', 'maps_ugc',
        'money', 'museum', 'navigation', 'pedal_bike', 'rate_review',
        'restaurant', 'restaurant_menu', 'satellite', 'set_meal', 'store_mall_directory',
        'terrain', 'traffic', 'wine_bar', 'wrong_location', 'zoom_in_map',
        'zoom_out_map', 'trip_origin', 'compass_calibration'
    ],
    
    // Accessibility
    'accessibility': [
        'accessibility', 'accessible', 'accessible_forward',
        'blind', 'braille', 'closed_caption', 'hearing', 'tty',
        'wheelchair_pickup', 'sign_language', 'record_voice_over', 'closed_caption_off',
        'audio_description', 'audio_file', 'mic', 'notifications_active',
        'play_circle', 'touch_app', 'keyboard_tab', 'keyboard_voice', 'hearing_disabled'
    ],
    
    // Social Media Icons
    'social': [
        'thumb_up', 'thumb_down', 'share', 'public', 'chat',
        'chat_bubble', 'chat_bubble_outline', 'comment', 'mail',
        'sentiment_satisfied', 'sentiment_dissatisfied', 'sentiment_neutral',
        'emoji_emotions', 'emoji_events', 'celebration', 'sports_esports',
        'group', 'groups', 'person', 'person_add', 'person_remove',
        'school', 'emoji_people', 'engineering', 'sports', 'cake',
        'deck', 'child_care', 'child_friendly', 'hotel', 'flight',
        'hiking', 'pool', 'spa', 'sports_basketball', 'sports_football',
        'sports_golf', 'sports_soccer', 'sports_tennis', 'sports_volleyball',
        'attractions', 'badge', 'family_restroom', 'female', 'male',
        'man', 'woman', 'wc', 'music_note', 'recommend'
    ]
};

// Initialize materialIcons array with all icons
for (const category in window.materialIconsByCategory) {
    window.materialIcons = window.materialIcons.concat(window.materialIconsByCategory[category]);
}

// Remove duplicates
window.materialIcons = [...new Set(window.materialIcons)];

// Additional function to get icons by category
function getIconsByCategory(category) {
    if (category === 'all') {
        return window.materialIcons;
    } else {
        return window.materialIconsByCategory[category] || [];
    }
}
