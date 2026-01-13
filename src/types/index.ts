// Blog Types
export interface Blog {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: string | null;
  cover_image_url: string | null;
  published_at: Date | null;
  read_time: number | null;
  layout_type: 'single-column' | 'two-column';
  max_width: string;
  show_table_of_contents: boolean;
  enable_voting: boolean;
  enable_social_share: boolean;
  enable_comments: boolean;
  status: 'published' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface BlogBlock {
  id: string;
  blog_id: string;
  block_type: 'heading' | 'paragraph' | 'code' | 'image' | 'callout' | 'list' | 'quote' | 'divider';
  block_order: number;
  content: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
}

export interface BlogTag {
  blog_id: string;
  tag_id: string;
}

export interface BlogLink {
  id: string;
  blog_id: string;
  label: string;
  url: string;
  link_type: 'internal' | 'external';
  link_order: number;
  created_at: Date;
}

export interface BlogVote {
  id: string;
  blog_id: string;
  ip_address: string | null;
  session_id: string | null;
  vote_type: 'upvote' | 'downvote';
  created_at: Date;
  updated_at: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: Date;
  start_time: string | null;
  end_time: string | null;
  color: 'blue' | 'green' | 'purple' | 'orange';
  blog_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  blog_id: string;
  name: string;
  comment: string;
  ip_address: string | null;
  status: 'approved' | 'pending' | 'spam' | 'deleted';
  created_at: Date;
  updated_at: Date;
}

export interface SearchHistory {
  id: string;
  ip_address: string | null;
  query: string;
  results_count: number | null;
  created_at: Date;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogMeta {
  title: string;
  description: string | null;
  author: string | null;
  publishedAt: string | null;
  readTime: number | null;
  coverImage: string | null;
}

export interface BlogLayout {
  type: 'single-column' | 'two-column';
  maxWidth: string;
  showTableOfContents: boolean;
}

export interface BlogSettings {
  enableVoting: boolean;
  enableSocialShare: boolean;
  enableComments: boolean;
}

export interface BlogVoting {
  enabled: boolean;
  upvotes: number;
  downvotes: number;
  userVote: 'upvote' | 'downvote' | null;
}

export interface BlogPreview {
  id: string;
  slug: string;
  meta: BlogMeta;
  tags: string[];
}

export interface BlogDetail extends BlogPreview {
  layout: BlogLayout;
  settings: BlogSettings;
  commentsCount: number;
  links: BlogLink[];
  blocks: BlogBlock[];
  voting: BlogVoting;
  socialShare: {
    enabled: boolean;
    platforms: string[];
  };
}

// Block Content Types
export interface HeadingBlockContent {
  level: number;
  text: string;
}

export interface ParagraphBlockContent {
  text: string;
}

export interface CodeBlockContent {
  code: string;
  language: string;
  filename: string | null;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  caption: string | null;
}

export interface CalloutBlockContent {
  variant: 'info' | 'warning' | 'error' | 'success';
  title: string;
  content: string;
}

export interface ListBlockContent {
  style: 'ordered' | 'unordered';
  items: string[];
}

export interface QuoteBlockContent {
  text: string;
  author: string | null;
}

export interface DividerBlockContent {}
