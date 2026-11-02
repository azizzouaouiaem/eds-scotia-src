import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Scotiabank hero: left-hand content (brand lockup, heading, body, two CTAs) over a
 * right-hand image. Rows: [image] [richtext]. The last two links in the richtext become
 * the primary (dark) and secondary (outline) call to action buttons.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const contentRow = rows[1];

  if (imageRow) {
    imageRow.classList.add('hero-image');
    imageRow.querySelectorAll('picture > img').forEach((img) => {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '1600' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      img.closest('picture').replaceWith(optimized);
    });
  }

  if (contentRow) {
    contentRow.classList.add('hero-content');
    const inner = contentRow.firstElementChild || contentRow;
    inner.classList.add('hero-content-inner');
    // brand lockup image (first picture) stays on top
    const brand = inner.querySelector('picture');
    if (brand) brand.closest('p')?.classList.add('hero-brands');
    // style the two CTA links
    const links = [...inner.querySelectorAll('a')];
    links.forEach((a, i) => {
      a.classList.add('button');
      a.classList.add(i === 0 ? 'primary' : 'secondary');
      const p = a.closest('p');
      if (p) p.classList.add('hero-cta');
    });
  }
}
