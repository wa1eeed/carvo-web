export interface Service {
  id: number;
  slug: string;
  title_en: string;
  title_ar?: string;
  category: string;
  short_description_en?: string;
  short_description_ar?: string;
  long_description_en?: string;
  long_description_ar?: string;
  icon_key?: string;
  cover_image?: string;
  highlights: string[];
  process_steps: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  cta_label_en?: string;
  cta_label_ar?: string;
  sort_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface SiteContent {
  [key: string]: string;
}

export interface Faq {
  id: number;
  question_en?: string;
  question_ar?: string;
  answer_en?: string;
  answer_ar?: string;
  category?: string;
  sort_order: number;
  is_active: boolean;
}

export interface AIConfig {
  primary_language: 'ar' | 'en' | 'auto';
  accent: string;
  chat_mode: string;
  voice_name: string;
  welcome_message_en: string;
  welcome_message_ar: string;
  enable_voice: boolean;
  enable_chat: boolean;
}
