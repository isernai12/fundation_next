const fs = require('fs');

let content = fs.readFileSync('src/features/members/components/member-form.tsx', 'utf8');

const replacements = {
  // Common
  'members.toggle_a8875b': 'members.common.toggle',
  
  // Toasts / Messages
  'members.k_a6be3c': 'members.messages.unexpected_error',
  'members.k_5a603e': 'members.messages.delete_success',
  '"সদস্য আপডেট করা হয়েছে"': 't("members.messages.update_success")',
  '"সদস্য যুক্ত করা হয়েছে"': 't("members.messages.add_success")',
  '"সদস্য সংরক্ষণ করতে ব্যর্থ হয়েছে"': 't("members.messages.save_error")',
  '"ডকুমেন্ট মুছে ফেলতে ব্যর্থ হয়েছে"': 't("members.messages.delete_error")',
  '"আপনি কি নিশ্চিত যে আপনি এই ডকুমেন্টটি মুছে ফেলতে চান?"': 't("members.messages.delete_confirm")',
  '"সংরক্ষণ করা হচ্ছে..."': 't("members.actions.saving")',
  '"সংরক্ষণ"': 't("members.actions.save")',

  // Edit Header
  'members.k_496d63': 'members.edit_header.member_id',
  'members.k_ec2310': 'members.edit_header.join_date',
  
  // Group Selector
  'members.k_b3ec52': 'members.group_selector.label',
  'members.k_bf667d': 'members.group_selector.placeholder',
  
  // Section 1
  'members.k_4042ae': 'members.personal_info.section_title',
  'members.k_4b63f5': 'members.personal_info.full_name',
  'members.k_285a7b': 'members.personal_info.full_name_placeholder',
  'members.k_e791f6': 'members.personal_info.father_name',
  'members.k_0c1c2f': 'members.personal_info.mother_name',
  'members.k_c98b8f': 'members.personal_info.dob',
  'members.k_0d54e7': 'members.personal_info.national_id_bc',
  'members.k_0628a2': 'members.personal_info.national_id_bc_placeholder',
  'members.k_82c623': 'members.personal_info.occupation',
  'members.k_190108': 'members.personal_info.occupation_placeholder',
  'members.k_2af4d4': 'members.personal_info.education',
  'members.k_be126b': 'members.personal_info.blood_group',
  'members.k_fb7b52': 'members.personal_info.blood_group_placeholder',
  'members.k_13fe24': 'A+', // Wait, these were translated via generic keys before? Or should I just use A+? I will just use text.
  'members.k_f0412e': 'A-',
  'members.k_f6fedd': 'B+',
  'members.k_308bb3': 'B-',
  'members.k_56539f': 'AB+',
  'members.k_9d30e2': 'AB-',
  'members.k_58616d': 'O+',
  'members.k_79e887': 'O-',
  'members.k_aebece': 'members.personal_info.mobile', // also used in emergency and reference
  'members.k_499303': 'members.personal_info.email',
  'members.example_email_com_845593': 'members.personal_info.email_placeholder',
  'members.k_8c4d12': 'members.personal_info.present_address',
  'members.k_494be0': 'members.personal_info.present_address_placeholder',
  'members.k_ae2bcf': 'members.personal_info.permanent_address',
  'members.k_dde7ef': 'members.personal_info.permanent_address_placeholder',

  // Section 2
  'members.k_abcb6d': 'members.emergency_contact.section_title',
  'members.k_eb9b5c': 'members.emergency_contact.name',
  'members.k_78b83d': 'members.emergency_contact.relation',
  // members.k_aebece -> members.emergency_contact.mobile (I will regex this)

  // Section 3
  'members.k_c351d8': 'members.reference.section_title',
  
  // Section 4
  'members.k_7520e8': 'members.commitment.section_title',
  'members.k_6012da': 'members.commitment.description',

  // Section 5
  'members.k_b77c08': 'members.documents.section_title',
  'members.k_60e21c': 'members.documents.member_photo',
  'members.k_1a5d37': 'members.documents.signature',
  'members.k_104386': 'members.documents.document_type',
  'members.nid_227d13': 'members.documents.nid',
  'members.k_5c49da': 'members.documents.birth_certificate',
  'members.k_764aac': 'members.documents.nid_front',
  'members.k_ff69d9': 'members.documents.nid_back',
  'members.k_55c70d': 'members.documents.upload_helper',
  '"JPEG, PNG বা JPG"': 't("members.documents.format_helper")',
  'members.preview_31fde7': 'members.documents.preview',
  'members.replace_0ebe6d': 'members.documents.replace',
  'members.delete_f2a6c4': 'members.documents.delete',
  'members.uploaded_on_8301c6': 'members.documents.uploaded_on',
  'members.k_de9b04': 'members.actions.cancel'
};

for (const [oldKey, newKey] of Object.entries(replacements)) {
  if (oldKey.includes(" ")) {
    content = content.replaceAll(oldKey, newKey);
  } else {
    // String keys inside t()
    content = content.replaceAll(`"${oldKey}"`, `"${newKey}"`);
  }
}

// Fix A+, A-, etc.
content = content.replaceAll(`t("A+")`, `"A+"`)
                 .replaceAll(`t("A-")`, `"A-"`)
                 .replaceAll(`t("B+")`, `"B+"`)
                 .replaceAll(`t("B-")`, `"B-"`)
                 .replaceAll(`t("AB+")`, `"AB+"`)
                 .replaceAll(`t("AB-")`, `"AB-"`)
                 .replaceAll(`t("O+")`, `"O+"`)
                 .replaceAll(`t("O-")`, `"O-"`);

// Fix mobile across different sections manually because they shared a generic key
// Replace the first occurrence of members.personal_info.mobile (which was k_aebece originally) in emergency contact and reference 
// Actually, `members.personal_info.mobile` works fine for the translation text itself, but let's be semantically correct.
content = content.replace(/name="emergencyContactMobile"[\s\S]*?t\("members\.personal_info\.mobile"\)/, 'name="emergencyContactMobile"\n              render={({ field }) => {\n                return ((\n                              <FormItem>\n                                <FormLabel>{t("members.emergency_contact.mobile")}</FormLabel>\n                                <FormControl>\n                                  <Input placeholder={t("members.emergency_contact.mobile")}"');

fs.writeFileSync('src/features/members/components/member-form.tsx', content);

