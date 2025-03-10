/**
 * Material Icons Library
 * Provides a list of available Material Icons for use in the admin interface
 */

// Define the global material icons array
window.materialIcons = [
    // Navigation Icons
    'arrow_back', 'arrow_forward', 'arrow_upward', 'arrow_downward',
    'menu', 'close', 'check', 'expand_more', 'expand_less',
    'home', 'search', 'settings', 'help', 'info',
    
    // Action Icons
    'delete', 'add', 'remove', 'edit', 'save',
    'favorite', 'bookmark', 'star', 'thumb_up', 'thumb_down',
    'visibility', 'visibility_off', 'lock', 'lock_open', 'share',
    
    // Content Icons
    'send', 'archive', 'mail', 'report', 'flag',
    'content_copy', 'content_cut', 'content_paste', 'filter_list', 'sort',
    'create', 'print', 'attach_file', 'link', 'cloud',
    
    // Communication Icons
    'chat', 'email', 'call', 'message', 'forum',
    'contact_mail', 'contacts', 'person', 'people', 'group',
    
    // Alert Icons
    'error', 'warning', 'info', 'help_outline', 'notification_important',
    
    // AV Icons
    'play_arrow', 'pause', 'stop', 'volume_up', 'volume_off',
    'fast_forward', 'fast_rewind', 'playlist_play', 'mic', 'videocam',
    
    // Device Icons
    'smartphone', 'tablet', 'laptop', 'desktop_windows', 'tv',
    'keyboard', 'mouse', 'battery_full', 'wifi', 'bluetooth',
    
    // UI & UX Icons
    'accessibility', 'accessible', 'account_circle', 'dashboard', 'face',
    'feedback', 'build', 'code', 'bug_report', 'extension',
    
    // Design & Development Icons
    'palette', 'color_lens', 'brush', 'format_paint', 'style',
    'straighten', 'crop', 'layers', 'widgets', 'grid_on',
    
    // Web Development Icons
    'language', 'public', 'vpn_lock', 'security', 'http',
    'developer_mode', 'devices', 'dns', 'storage', 'memory',
    
    // UX Research & Testing
    'psychology', 'speed', 'assessment', 'trending_up', 'timeline',
    'pie_chart', 'bar_chart', 'scatter_plot', 'analytics', 'insights',
    
    // Layout & Navigation Icons
    'format_align_center', 'format_align_left', 'format_align_right',
    'format_bold', 'format_italic', 'format_list_bulleted', 'format_list_numbered',
    'table_chart', 'view_module', 'view_list', 'view_comfy', 'menu_book',
    
    // Specialized Icons for CX
    'thumb_up_alt', 'sentiment_satisfied', 'sentiment_dissatisfied',
    'school', 'lightbulb', 'psychology', 'groups', 'design_services',
    'integration_instructions', 'touch_app', 'fingerprint', 'handyman',
    
    // Business & Commerce
    'shopping_cart', 'storefront', 'receipt', 'payments', 'credit_card',
    'account_balance', 'work', 'business', 'handshake', 'verified',
    
    // Performance
    'speed', 'flash_on', 'bolt', 'trending_up', 'error_outline',
    'auto_fix_high', 'check_circle', 'check_circle_outline', 'done_all', 'published_with_changes'
];

// Additional function to get icons by category
function getIconsByCategory(category) {
    const categories = {
        'navigation': ['arrow_back', 'arrow_forward', 'menu', 'close', 'home', 'search'],
        'actions': ['delete', 'add', 'edit', 'save', 'favorite', 'bookmark'],
        'content': ['send', 'archive', 'mail', 'report', 'filter_list', 'sort'],
        'communication': ['chat', 'email', 'call', 'message', 'person', 'people'],
        'alerts': ['error', 'warning', 'info', 'help_outline', 'notification_important'],
        'ux': ['psychology', 'accessibility', 'sentiment_satisfied', 'touch_app', 'speed']
    };
    
    return categories[category] || [];
}
