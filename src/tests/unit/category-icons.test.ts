import { describe, it, expect } from 'vitest';
import { getCategoryIcon } from '../../lib/categoryIcons';

describe('getCategoryIcon', () => {
  it('returns a valid component for known icon names', () => {
    const knownIcons = [
      'car', 'smartphone', 'shirt', 'home', 'briefcase',
      'wrench', 'trophy', 'sofa', 'paw-print', 'wheat',
      'building-2', 'users',
    ];
    knownIcons.forEach((name) => {
      const Icon = getCategoryIcon(name);
      expect(Icon).toBeDefined();
      expect(Icon).not.toBeNull();
    });
  });

  it('returns the fallback Tag icon for an unknown icon name', () => {
    const FallbackIcon = getCategoryIcon('unknown-icon-name');
    const TagIcon = getCategoryIcon('tag');
    expect(FallbackIcon).toBe(TagIcon);
  });

  it('returns the fallback Tag icon for an empty string', () => {
    const FallbackIcon = getCategoryIcon('');
    const TagIcon = getCategoryIcon('tag');
    expect(FallbackIcon).toBe(TagIcon);
  });

  it('returns different components for different icon names', () => {
    const CarIcon = getCategoryIcon('car');
    const PhoneIcon = getCategoryIcon('smartphone');
    expect(CarIcon).not.toBe(PhoneIcon);
  });
});
