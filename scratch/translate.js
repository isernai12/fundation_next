const fs = require('fs');
const path = require('path');

const map = {
  // general-settings-form.tsx
  '"Settings saved successfully"': 't("settings.settings_saved_successfully")',
  '"Failed to save settings"': 't("settings.failed_to_save_settings")',
  '>System Settings<': '>{t("settings.system_settings")}<',
  '>Configure global application preferences and defaults.<': '>{t("settings.configure_global_app_prefs")}<',
  '>Time Zone<': '>{t("settings.time_zone")}<',
  '"Select time zone"': 't("settings.select_time_zone")',
  '>Date Format<': '>{t("settings.date_format")}<',
  '"Select date format"': 't("settings.select_date_format")',
  '>Default Theme<': '>{t("settings.default_theme")}<',
  '"Select theme"': 't("settings.select_theme")',
  '>Light<': '>{t("settings.light")}<',
  '>Dark<': '>{t("settings.dark")}<',
  '>System Default<': '>{t("settings.system_default")}<',
  'isSaving ? "Saving..." : "Save Changes"': 'isSaving ? t("settings.saving") : t("settings.save_changes")',

  // profile-form.tsx
  '"Profile saved successfully"': 't("settings.profile_saved_successfully")',
  '"Failed to save profile"': 't("settings.failed_to_save_profile")',
  '>Foundation Profile<': '>{t("settings.foundation_profile")}<',
  '>Update your organization\'s primary information.<': '>{t("settings.update_org_primary_info")}<',
  '>Organization Name<': '>{t("settings.organization_name")}<',
  '>Registration Number<': '>{t("settings.registration_number")}<',
  '>Email<': '>{t("settings.email")}<',
  '>Phone<': '>{t("settings.phone")}<',
  '>Address<': '>{t("settings.address")}<',
  '>Website<': '>{t("settings.website")}<',
  '>Currency<': '>{t("settings.currency")}<',

  // backup-client.tsx
  '"Backup download started successfully"': 't("settings.backup_started")',
  '"Failed to create backup"': 't("settings.failed_to_create_backup")',
  '"Are you sure? This will overwrite all data! This action cannot be undone."': 't("settings.backup_warning")',
  '"Failed to restore backup"': 't("settings.failed_to_restore_backup")',
  '"Database restored successfully"': 't("settings.db_restored")',
  '>Create Backup<': '>{t("settings.create_backup")}<',
  '>Generate a secure snapshot of your entire database.<': '>{t("settings.generate_secure_snapshot")}<',
  '>This will lock write operations momentarily to ensure data consistency, then create a complete database dump in ZIP format.<': '>{t("settings.backup_desc")}<',
  'isBackingUp ? "Generating Backup..." : "Generate Full Backup"': 'isBackingUp ? t("settings.generating_backup") : t("settings.generate_full_backup")',
  '>Restore Backup<': '>{t("settings.restore_backup")}<',
  '>Restore the database from an existing backup file.<': '>{t("settings.restore_desc")}<',
  '>Warning: Restoring a backup will overwrite all current data. This action cannot be undone.<': '>{t("settings.restore_warning")}<',
  'isRestoring ? "Restoring..." : "Upload & Restore"': 'isRestoring ? t("settings.restoring") : t("settings.upload_and_restore")',

  // foundation-branding-form.tsx
  '"Invalid file type. Supported: PNG, JPG, WEBP"': 't("settings.invalid_file_type")',
  '", ICO"': 't("settings.ico")',
  '", SVG"': 't("settings.svg")',
  '"File size must be less than 2MB"': 't("settings.file_size_error")',
  '`Image uploaded for ${fieldName.split(\'_\').slice(1).join(\' \').toLowerCase()}.`': 't("settings.image_uploaded", { field: fieldName.split(\'_\').slice(1).join(\' \').toLowerCase() })',
  '"Failed to upload image"': 't("settings.failed_to_upload_image")',
  '"Foundation branding updated successfully"': 't("settings.branding_updated")',
  '"Failed to update branding settings"': 't("settings.failed_to_update_branding")',
  'title="Delete Logo"': 'title={t("settings.delete_logo")}',
  '>Foundation Branding<': '>{t("settings.foundation_branding")}<',
  '>Customize the visual identity of your foundation across the application.<': '>{t("settings.customize_visual_identity")}<',
  '>Foundation Name<': '>{t("settings.foundation_name")}<',
  'placeholder="e.g. Acme Foundation"': 'placeholder={t("settings.eg_acme_foundation")}',
  '>Short Name<': '>{t("settings.short_name")}<',
  'placeholder="e.g. Acme"': 'placeholder={t("settings.eg_acme")}',
  '>Logos & Assets<': '>{t("settings.logos_and_assets")}<',
  'label="Primary Logo"': 'label={t("settings.primary_logo")}',
  'description="Used in main navigation and default displays."': 'description={t("settings.primary_logo_desc")}',
  'label="Favicon"': 'label={t("settings.favicon")}',
  'description="Small icon shown in the browser tab (ideally 32x32px or 64x64px)."': 'description={t("settings.favicon_desc")}',
  'label="Login Page Logo"': 'label={t("settings.login_logo")}',
  'description="Prominent logo displayed on the authentication screens."': 'description={t("settings.login_logo_desc")}',
  'label="Sidebar Logo"': 'label={t("settings.sidebar_logo")}',
  'description="Logo shown at the top of the application sidebar."': 'description={t("settings.sidebar_logo_desc")}',
  'label="Header Logo"': 'label={t("settings.header_logo")}',
  'description="Logo shown in the top header or mobile view."': 'description={t("settings.header_logo_desc")}',
  '>Save Branding Options<': '>{t("settings.save_branding_options")}<',

  // financial-rules-form.tsx
  '"Financial rules saved successfully"': 't("settings.financial_rules_saved")',
  '"Failed to save financial rules"': 't("settings.failed_to_save_financial_rules")',
  '>Financial Rules<': '>{t("settings.financial_rules")}<',
  '>Configure currency, number formats, and fiscal year settings.<': '>{t("settings.configure_currency_formats")}<',
  '>Default Currency<': '>{t("settings.default_currency")}<',
  '>Currency Symbol<': '>{t("settings.currency_symbol")}<',
  '>Decimal Places<': '>{t("settings.decimal_places")}<',
  '"Select decimal places"': 't("settings.select_decimal_places")',
  '>Number Format<': '>{t("settings.number_format")}<',
  '"Select number format"': 't("settings.select_number_format")',
  '>1,00,000.00 (Indian/South Asian)<': '>{t("settings.indian_south_asian")}<',
  '>100,000.00 (Western)<': '>{t("settings.western")}<',
  '>100.000,00 (European)<': '>{t("settings.european")}<',
  '>Financial Year Start<': '>{t("settings.fin_year_start")}<',
  '"Select month"': 't("settings.select_month")',
  '>Financial Year End<': '>{t("settings.fin_year_end")}<',
  '>Negative Number Style<': '>{t("settings.negative_number_style")}<',
  '"Select style"': 't("settings.select_style")',
  '>-100 (Minus Sign)<': '>{t("settings.minus_sign")}<',
  '>(100) (Parentheses)<': '>{t("settings.parentheses")}<',
  '>Rounding Method<': '>{t("settings.rounding_method")}<',
  '"Select rounding method"': 't("settings.select_rounding_method")',
  '>Round to Nearest<': '>{t("settings.round_nearest")}<',
  '>Round Up<': '>{t("settings.round_up")}<',
  '>Round Down<': '>{t("settings.round_down")}<',

  // personal-profile-form.tsx
  '"Profile picture uploaded. Please save changes."': 't("settings.profile_pic_uploaded")',
  '"Failed to upload profile picture"': 't("settings.failed_to_upload_profile_pic")',
  '"Personal profile updated successfully"': 't("settings.personal_profile_updated")',
  '>Personal Profile<': '>{t("settings.personal_profile")}<',
  '>Update your personal details and profile picture.<': '>{t("settings.update_personal_details")}<',
  '>Change Picture<': '>{t("settings.change_picture")}<',
  '>Full Name<': '>{t("settings.full_name")}<',
  '>Mobile Number<': '>{t("settings.mobile_number")}<',
  '>Email Address<': '>{t("settings.email_address")}<',
  '>Save Changes<': '>{t("settings.save_changes")}<',

  // preferences-form.tsx
  '"Preferences saved successfully"': 't("settings.preferences_saved")',
  '"Failed to save preferences"': 't("settings.failed_to_save_prefs")',
  '>User Preferences<': '>{t("settings.user_prefs")}<',
  '>Personalize your experience.<': '>{t("settings.personalize_experience")}<',
  '>Language<': '>{t("settings.language")}<',
  '"Select language"': 't("settings.select_language")',
  '>English<': '>{t("settings.english")}<',
  '>Spanish<': '>{t("settings.spanish")}<',
  '>Bengali<': '>{t("settings.bengali")}<',
  '>Theme<': '>{t("settings.theme")}<',
  '>Date Format Override<': '>{t("settings.date_format_override")}<',
  '"Select date format override"': 't("settings.select_date_format_override")',
  '>None (Use System Default)<': '>{t("settings.none_use_system_default")}<',
  '>Time Format<': '>{t("settings.time_format")}<',
  '"Select time format"': 't("settings.select_time_format")',
  '>12-hour<': '>{t("settings.12_hour")}<',
  '>24-hour<': '>{t("settings.24_hour")}<',
  '>Table Density<': '>{t("settings.table_density")}<',
  '"Select table density"': 't("settings.select_table_density")',
  '>Compact<': '>{t("settings.compact")}<',
  '>Comfortable<': '>{t("settings.comfortable")}<',
  '>Default Dashboard<': '>{t("settings.default_dashboard")}<',
  '"Select default dashboard"': 't("settings.select_default_dashboard")',
  '>Overview<': '>{t("settings.overview")}<',
  '>Financials<': '>{t("settings.financials")}<',
  '>Operations<': '>{t("settings.operations")}<',
  '>Items Per Page<': '>{t("settings.items_per_page")}<',
  '"Select items per page"': 't("settings.select_items_per_page")',
  'isSaving ? "Saving..." : "Save Preferences"': 'isSaving ? t("settings.saving") : t("settings.save_preferences")',

  // roles-manager.tsx
  '"Role permissions updated successfully"': 't("settings.role_permissions_updated")',
  '"Failed to update permissions"': 't("settings.failed_to_update_permissions")',
  '"রোল ও পারমিশন কন্ট্রোল"': 't("settings.role_permissions_control")',
  '"হায়ারার্কিক্যাল মডিউল, সাবমেনু ও অ্যাকশন পারমিশন নির্বাচন করুন।"': 't("settings.select_hierarchical_permissions")',
  '>রোল তালিকা (Roles)<': '>{t("settings.roles_list")}<',
  '>পারমিশন পরিবর্তন করতে রোল নির্বাচন করুন<': '>{t("settings.select_role_to_change_permissions")}<',
  '"Select a role"': 't("settings.select_a_role")',
  '>পারমিশন গাছ (Tree): <': '>{t("settings.permission_tree")}<',
  '>মডিউল ➔ সাবমেনু ➔ অ্যাকশন হায়ারার্কি অনুসারে রোল অনুমতি দিন।<': '>{t("settings.grant_role_permissions_by_hierarchy")}<',
  'saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"': 'saving ? t("settings.saving_bn") : t("settings.save_changes_bn")',
  '>SUPER_ADMIN রোলের জন্য সমস্ত মডিউল ও অ্যাকশন স্বয়ংক্রিয়ভাবে সক্রিয় করা থাকে।<': '>{t("settings.super_admin_notice")}<',
  ' সক্রিয়': ' {t("settings.active_bn")}'
};

const jsonMap = {
  settings_saved_successfully: ["Settings saved successfully", "সেটিংস সফলভাবে সংরক্ষিত হয়েছে"],
  failed_to_save_settings: ["Failed to save settings", "সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে"],
  system_settings: ["System Settings", "সিস্টেম সেটিংস"],
  configure_global_app_prefs: ["Configure global application preferences and defaults.", "গ্লোবাল অ্যাপ্লিকেশন পছন্দ এবং ডিফল্ট কনফিগার করুন।"],
  time_zone: ["Time Zone", "টাইম জোন"],
  select_time_zone: ["Select time zone", "টাইম জোন নির্বাচন করুন"],
  date_format: ["Date Format", "তারিখ বিন্যাস"],
  select_date_format: ["Select date format", "তারিখ বিন্যাস নির্বাচন করুন"],
  default_theme: ["Default Theme", "ডিফল্ট থিম"],
  select_theme: ["Select theme", "থিম নির্বাচন করুন"],
  light: ["Light", "হালকা"],
  dark: ["Dark", "গাঢ়"],
  system_default: ["System Default", "সিস্টেম ডিফল্ট"],
  saving: ["Saving...", "সংরক্ষণ করা হচ্ছে..."],
  save_changes: ["Save Changes", "পরিবর্তন সংরক্ষণ করুন"],

  profile_saved_successfully: ["Profile saved successfully", "প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে"],
  failed_to_save_profile: ["Failed to save profile", "প্রোফাইল সংরক্ষণ করতে ব্যর্থ হয়েছে"],
  foundation_profile: ["Foundation Profile", "ফাউন্ডেশন প্রোফাইল"],
  update_org_primary_info: ["Update your organization's primary information.", "আপনার প্রতিষ্ঠানের প্রাথমিক তথ্য আপডেট করুন।"],
  organization_name: ["Organization Name", "প্রতিষ্ঠানের নাম"],
  registration_number: ["Registration Number", "নিবন্ধন নম্বর"],
  email: ["Email", "ইমেইল"],
  phone: ["Phone", "ফোন"],
  address: ["Address", "ঠিকানা"],
  website: ["Website", "ওয়েবসাইট"],
  currency: ["Currency", "মুদ্রা"],

  backup_started: ["Backup download started successfully", "ব্যাকআপ ডাউনলোড সফলভাবে শুরু হয়েছে"],
  failed_to_create_backup: ["Failed to create backup", "ব্যাকআপ তৈরি করতে ব্যর্থ হয়েছে"],
  backup_warning: ["Are you sure? This will overwrite all data! This action cannot be undone.", "আপনি কি নিশ্চিত? এটি সমস্ত ডেটা মুছে ফেলবে! এই কাজটি বাতিল করা যাবে না।"],
  failed_to_restore_backup: ["Failed to restore backup", "ব্যাকআপ পুনরুদ্ধার করতে ব্যর্থ হয়েছে"],
  db_restored: ["Database restored successfully", "ডেটাবেস সফলভাবে পুনরুদ্ধার করা হয়েছে"],
  create_backup: ["Create Backup", "ব্যাকআপ তৈরি করুন"],
  generate_secure_snapshot: ["Generate a secure snapshot of your entire database.", "আপনার সম্পূর্ণ ডেটাবেসের একটি সুরক্ষিত স্ন্যাপশট তৈরি করুন।"],
  backup_desc: ["This will lock write operations momentarily to ensure data consistency, then create a complete database dump in ZIP format.", "এটি ডেটা ধারাবাহিকতা নিশ্চিত করার জন্য লেখার কাজগুলি সাময়িকভাবে লক করবে, তারপর জিপ ফর্ম্যাটে একটি সম্পূর্ণ ডেটাবেস ডাম্প তৈরি করবে।"],
  generating_backup: ["Generating Backup...", "ব্যাকআপ তৈরি হচ্ছে..."],
  generate_full_backup: ["Generate Full Backup", "সম্পূর্ণ ব্যাকআপ তৈরি করুন"],
  restore_backup: ["Restore Backup", "ব্যাকআপ পুনরুদ্ধার করুন"],
  restore_desc: ["Restore the database from an existing backup file.", "একটি বিদ্যমান ব্যাকআপ ফাইল থেকে ডেটাবেস পুনরুদ্ধার করুন।"],
  restore_warning: ["Warning: Restoring a backup will overwrite all current data. This action cannot be undone.", "সতর্কতা: ব্যাকআপ পুনরুদ্ধার করলে সমস্ত বর্তমান ডেটা মুছে যাবে। এই কাজটি বাতিল করা যাবে না।"],
  restoring: ["Restoring...", "পুনরুদ্ধার হচ্ছে..."],
  upload_and_restore: ["Upload & Restore", "আপলোড ও পুনরুদ্ধার করুন"],

  invalid_file_type: ["Invalid file type. Supported: PNG, JPG, WEBP", "অবৈধ ফাইলের ধরণ। সমর্থিত: PNG, JPG, WEBP"],
  ico: [", ICO", ", ICO"],
  svg: [", SVG", ", SVG"],
  file_size_error: ["File size must be less than 2MB", "ফাইলের আকার 2MB এর কম হতে হবে"],
  image_uploaded: ["Image uploaded for {{field}}.", "{{field}} এর জন্য ছবি আপলোড করা হয়েছে।"],
  failed_to_upload_image: ["Failed to upload image", "ছবি আপলোড করতে ব্যর্থ হয়েছে"],
  branding_updated: ["Foundation branding updated successfully", "ফাউন্ডেশন ব্র্যান্ডিং সফলভাবে আপডেট করা হয়েছে"],
  failed_to_update_branding: ["Failed to update branding settings", "ব্র্যান্ডিং সেটিংস আপডেট করতে ব্যর্থ হয়েছে"],
  delete_logo: ["Delete Logo", "লোগো মুছুন"],
  foundation_branding: ["Foundation Branding", "ফাউন্ডেশন ব্র্যান্ডিং"],
  customize_visual_identity: ["Customize the visual identity of your foundation across the application.", "অ্যাপ্লিকেশন জুড়ে আপনার ফাউন্ডেশনের দৃশ্যমান পরিচিতি কাস্টমাইজ করুন।"],
  foundation_name: ["Foundation Name", "ফাউন্ডেশনের নাম"],
  eg_acme_foundation: ["e.g. Acme Foundation", "যেমন: একমি ফাউন্ডেশন"],
  short_name: ["Short Name", "সংক্ষিপ্ত নাম"],
  eg_acme: ["e.g. Acme", "যেমন: একমি"],
  logos_and_assets: ["Logos & Assets", "লোগো এবং সম্পদ"],
  primary_logo: ["Primary Logo", "প্রাথমিক লোগো"],
  primary_logo_desc: ["Used in main navigation and default displays.", "মূল নেভিগেশন এবং ডিফল্ট প্রদর্শনে ব্যবহৃত হয়।"],
  favicon: ["Favicon", "ফেভিকন"],
  favicon_desc: ["Small icon shown in the browser tab (ideally 32x32px or 64x64px).", "ব্রাউজার ট্যাবে দেখানো ছোট আইকন (আদর্শভাবে 32x32px বা 64x64px)।"],
  login_logo: ["Login Page Logo", "লগইন পৃষ্ঠার লোগো"],
  login_logo_desc: ["Prominent logo displayed on the authentication screens.", "প্রমাণীকরণ পর্দায় প্রদর্শিত বিশিষ্ট লোগো।"],
  sidebar_logo: ["Sidebar Logo", "সাইডবার লোগো"],
  sidebar_logo_desc: ["Logo shown at the top of the application sidebar.", "অ্যাপ্লিকেশন সাইডবারের শীর্ষে দেখানো লোগো।"],
  header_logo: ["Header Logo", "হেডার লোগো"],
  header_logo_desc: ["Logo shown in the top header or mobile view.", "শীর্ষ হেডার বা মোবাইল ভিউতে দেখানো লোগো।"],
  save_branding_options: ["Save Branding Options", "ব্র্যান্ডিং বিকল্প সংরক্ষণ করুন"],

  financial_rules_saved: ["Financial rules saved successfully", "আর্থিক নিয়ম সফলভাবে সংরক্ষিত হয়েছে"],
  failed_to_save_financial_rules: ["Failed to save financial rules", "আর্থিক নিয়ম সংরক্ষণ করতে ব্যর্থ হয়েছে"],
  financial_rules: ["Financial Rules", "আর্থিক নিয়ম"],
  configure_currency_formats: ["Configure currency, number formats, and fiscal year settings.", "মুদ্রা, সংখ্যার বিন্যাস এবং অর্থ বছর সেটিংস কনফিগার করুন।"],
  default_currency: ["Default Currency", "ডিফল্ট মুদ্রা"],
  currency_symbol: ["Currency Symbol", "মুদ্রার প্রতীক"],
  decimal_places: ["Decimal Places", "দশমিক স্থান"],
  select_decimal_places: ["Select decimal places", "দশমিক স্থান নির্বাচন করুন"],
  number_format: ["Number Format", "সংখ্যার বিন্যাস"],
  select_number_format: ["Select number format", "সংখ্যার বিন্যাস নির্বাচন করুন"],
  indian_south_asian: ["1,00,000.00 (Indian/South Asian)", "১,০০,০০০.০০ (ভারতীয়/দক্ষিণ এশীয়)"],
  western: ["100,000.00 (Western)", "১০০,০০০.০০ (পাশ্চাত্য)"],
  european: ["100.000,00 (European)", "১০০.০০০,০০ (ইউরোপীয়)"],
  fin_year_start: ["Financial Year Start", "অর্থ বছরের শুরু"],
  select_month: ["Select month", "মাস নির্বাচন করুন"],
  fin_year_end: ["Financial Year End", "অর্থ বছরের শেষ"],
  negative_number_style: ["Negative Number Style", "ঋণাত্মক সংখ্যার শৈলী"],
  select_style: ["Select style", "শৈলী নির্বাচন করুন"],
  minus_sign: ["-100 (Minus Sign)", "-100 (বিয়োগ চিহ্ন)"],
  parentheses: ["(100) (Parentheses)", "(100) (বন্ধনী)"],
  rounding_method: ["Rounding Method", "রাউন্ডিং পদ্ধতি"],
  select_rounding_method: ["Select rounding method", "রাউন্ডিং পদ্ধতি নির্বাচন করুন"],
  round_nearest: ["Round to Nearest", "নিকটতম সংখ্যায় রাউন্ড করুন"],
  round_up: ["Round Up", "উপরে রাউন্ড করুন"],
  round_down: ["Round Down", "নীচে রাউন্ড করুন"],

  profile_pic_uploaded: ["Profile picture uploaded. Please save changes.", "প্রোফাইল ছবি আপলোড হয়েছে। অনুগ্রহ করে পরিবর্তন সংরক্ষণ করুন।"],
  failed_to_upload_profile_pic: ["Failed to upload profile picture", "প্রোফাইল ছবি আপলোড করতে ব্যর্থ হয়েছে"],
  personal_profile_updated: ["Personal profile updated successfully", "ব্যক্তিগত প্রোফাইল সফলভাবে আপডেট করা হয়েছে"],
  personal_profile: ["Personal Profile", "ব্যক্তিগত প্রোফাইল"],
  update_personal_details: ["Update your personal details and profile picture.", "আপনার ব্যক্তিগত বিবরণ এবং প্রোফাইল ছবি আপডেট করুন।"],
  change_picture: ["Change Picture", "ছবি পরিবর্তন করুন"],
  full_name: ["Full Name", "পুরো নাম"],
  mobile_number: ["Mobile Number", "মোবাইল নম্বর"],
  email_address: ["Email Address", "ইমেইল ঠিকানা"],

  preferences_saved: ["Preferences saved successfully", "পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে"],
  failed_to_save_prefs: ["Failed to save preferences", "পছন্দসমূহ সংরক্ষণ করতে ব্যর্থ হয়েছে"],
  user_prefs: ["User Preferences", "ব্যবহারকারীর পছন্দসমূহ"],
  personalize_experience: ["Personalize your experience.", "আপনার অভিজ্ঞতা ব্যক্তিগতকরণ করুন।"],
  language: ["Language", "ভাষা"],
  select_language: ["Select language", "ভাষা নির্বাচন করুন"],
  english: ["English", "ইংরেজি"],
  spanish: ["Spanish", "স্প্যানিশ"],
  bengali: ["Bengali", "বাংলা"],
  theme: ["Theme", "থিম"],
  date_format_override: ["Date Format Override", "তারিখ বিন্যাস ওভাররাইড"],
  select_date_format_override: ["Select date format override", "তারিখ বিন্যাস ওভাররাইড নির্বাচন করুন"],
  none_use_system_default: ["None (Use System Default)", "কোনটি নয় (সিস্টেম ডিফল্ট ব্যবহার করুন)"],
  time_format: ["Time Format", "সময় বিন্যাস"],
  select_time_format: ["Select time format", "সময় বিন্যাস নির্বাচন করুন"],
  "12_hour": ["12-hour", "১২-ঘণ্টা"],
  "24_hour": ["24-hour", "২৪-ঘণ্টা"],
  table_density: ["Table Density", "টেবিলের ঘনত্ব"],
  select_table_density: ["Select table density", "টেবিলের ঘনত্ব নির্বাচন করুন"],
  compact: ["Compact", "কমপ্যাক্ট"],
  comfortable: ["Comfortable", "আরামদায়ক"],
  default_dashboard: ["Default Dashboard", "ডিফল্ট ড্যাশবোর্ড"],
  select_default_dashboard: ["Select default dashboard", "ডিফল্ট ড্যাশবোর্ড নির্বাচন করুন"],
  overview: ["Overview", "ওভারভিউ"],
  financials: ["Financials", "আর্থিক"],
  operations: ["Operations", "অপারেশনস"],
  items_per_page: ["Items Per Page", "প্রতি পৃষ্ঠায় আইটেম"],
  select_items_per_page: ["Select items per page", "প্রতি পৃষ্ঠায় আইটেম নির্বাচন করুন"],
  save_preferences: ["Save Preferences", "পছন্দসমূহ সংরক্ষণ করুন"],

  role_permissions_updated: ["Role permissions updated successfully", "রোল পারমিশন সফলভাবে আপডেট করা হয়েছে"],
  failed_to_update_permissions: ["Failed to update permissions", "পারমিশন আপডেট করতে ব্যর্থ হয়েছে"],
  role_permissions_control: ["Roles & Permission Control", "রোল ও পারমিশন কন্ট্রোল"],
  select_hierarchical_permissions: ["Select hierarchical module, submenu, and action permissions.", "হায়ারার্কিক্যাল মডিউল, সাবমেনু ও অ্যাকশন পারমিশন নির্বাচন করুন।"],
  roles_list: ["Roles List", "রোল তালিকা (Roles)"],
  select_role_to_change_permissions: ["Select role to change permissions", "পারমিশন পরিবর্তন করতে রোল নির্বাচন করুন"],
  select_a_role: ["Select a role", "একটি রোল নির্বাচন করুন"],
  permission_tree: ["Permission Tree:", "পারমিশন গাছ (Tree): "],
  grant_role_permissions_by_hierarchy: ["Grant role permissions by module ➔ submenu ➔ action hierarchy.", "মডিউল ➔ সাবমেনু ➔ অ্যাকশন হায়ারার্কি অনুসারে রোল অনুমতি দিন।"],
  saving_bn: ["Saving...", "সংরক্ষণ হচ্ছে..."],
  save_changes_bn: ["Save Changes", "পরিবর্তন সংরক্ষণ করুন"],
  super_admin_notice: ["All modules and actions are automatically enabled for the SUPER_ADMIN role.", "SUPER_ADMIN রোলের জন্য সমস্ত মডিউল ও অ্যাকশন স্বয়ংক্রিয়ভাবে সক্রিয় করা থাকে।"],
  active_bn: ["Active", "সক্রিয়"]
};

const finalJson = { en: { settings: {} }, bn: { settings: {} } };
for (const key in jsonMap) {
  finalJson.en.settings[key] = jsonMap[key][0];
  finalJson.bn.settings[key] = jsonMap[key][1];
}

fs.writeFileSync('/workspaces/foundation-design/scratch/team-c-translations/settings.json', JSON.stringify(finalJson, null, 2));

const files = [
  'src/features/settings/roles/roles-manager.tsx',
  'src/features/settings/components/personal-profile-form.tsx',
  'src/features/settings/components/financial-rules-form.tsx',
  'src/features/settings/components/foundation-branding-form.tsx',
  'src/features/settings/components/backup-client.tsx',
  'src/features/settings/components/profile-form.tsx',
  'src/features/settings/components/general-settings-form.tsx',
  'src/features/settings/components/preferences-form.tsx'
];

files.forEach(f => {
  const fp = path.join('/workspaces/foundation-design', f);
  if (!fs.existsSync(fp)) return;
  
  let c = fs.readFileSync(fp, 'utf-8');

  // Ensure imports and hooks are added only to valid react component files.
  // We'll skip use client if it's already there
  let hasClient = c.includes('"use client"');
  if (!hasClient && (f.endsWith('.tsx') || f.endsWith('.ts'))) {
      c = '"use client";\n' + c;
  }
  
  if (!c.includes('useLanguage')) {
    // Add import right after the first string of imports or on top
    c = c.replace(/(import.*?\n)/, '$1import { useLanguage } from "@/i18n/LanguageProvider";\n');
  }

  // Inject const { t } = useLanguage() into all exported functions starting with capital letter
  const fnMatch = c.match(/export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{/g);
  if (fnMatch) {
    fnMatch.forEach(match => {
      const fnHeader = match;
      if (!c.includes('const { t } = useLanguage();', c.indexOf(fnHeader))) {
          c = c.replace(fnHeader, fnHeader + '\n  const { t } = useLanguage();');
      }
    });
  }

  // For nested functions like ImageUploadField
  const nestedMatch = c.match(/function\s+ImageUploadField\s*\([^)]*\)\s*\{/);
  if (nestedMatch) {
      if (!c.includes('const { t } = useLanguage();', c.indexOf(nestedMatch[0]))) {
          c = c.replace(nestedMatch[0], nestedMatch[0] + '\n  const { t } = useLanguage();');
      }
  }

  // Process text replacements
  for (const [search, replacement] of Object.entries(map)) {
    c = c.split(search).join(replacement);
  }

  fs.writeFileSync(fp, c);
});
