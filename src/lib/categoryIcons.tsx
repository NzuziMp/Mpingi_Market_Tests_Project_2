import { Car, Smartphone, Shirt, Home, Briefcase, Wrench, Trophy, Sofa, PawPrint, Wheat, Building2, Users, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  smartphone: Smartphone,
  shirt: Shirt,
  home: Home,
  briefcase: Briefcase,
  wrench: Wrench,
  trophy: Trophy,
  sofa: Sofa,
  'paw-print': PawPrint,
  wheat: Wheat,
  'building-2': Building2,
  users: Users,
  tag: Tag,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Tag;
}
