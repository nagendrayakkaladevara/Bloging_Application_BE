import { BlogBlock } from '../types';

export function calculateReadTime(blocks: BlogBlock[]): number {
  let totalWords = 0;

  for (const block of blocks) {
    switch (block.block_type) {
      case 'heading':
        if (block.content.text) {
          totalWords += block.content.text.split(/\s+/).length;
        }
        break;
      case 'paragraph':
        if (block.content.text) {
          totalWords += block.content.text.split(/\s+/).length;
        }
        break;
      case 'quote':
        if (block.content.text) {
          totalWords += block.content.text.split(/\s+/).length;
        }
        break;
      case 'callout':
        if (block.content.title) {
          totalWords += block.content.title.split(/\s+/).length;
        }
        if (block.content.content) {
          totalWords += block.content.content.split(/\s+/).length;
        }
        break;
      case 'list':
        if (block.content.items && Array.isArray(block.content.items)) {
          block.content.items.forEach((item: string) => {
            totalWords += item.split(/\s+/).length;
          });
        }
        break;
      case 'code':
        // Code blocks typically take longer to read
        if (block.content.code) {
          const codeLines = block.content.code.split('\n').length;
          totalWords += codeLines * 5; // Estimate 5 words per line of code
        }
        break;
    }
  }

  // Average reading speed: 200 words per minute
  const readTime = Math.ceil(totalWords / 200);
  return readTime > 0 ? readTime : 1; // Minimum 1 minute
}
