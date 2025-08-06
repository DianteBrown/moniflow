import {
  Baby,
  Beef,
  Beer,
  Building2,
  Bus,
  Car,
  CarTaxiFront,
  Coffee,
  CreditCard,
  DollarSign,
  Drumstick,
  GraduationCap,
  Factory,
  Film,
  Flower2,
  Fuel,
  Gamepad2,
  Gift,
  Glasses,
  Dumbbell,
  HandCoins,
  Heart,
  Home,
  Hotel,
  Library,
  Lightbulb,
  Cross,
  MonitorSmartphone,
  Music2,
  Newspaper,
  Palette,
  Pencil,
  Pill,
  Pizza,
  Plane,
  Receipt,
  Scissors,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Stethoscope,
  Ticket,
  Train,
  TrendingUp,
  Trophy,
  Tv,
  Wallet,
  Warehouse,
  Wifi,
  Wine,
  Wrench,
  type LucideIcon
} from 'lucide-react';

export interface CategoryIcon {
  id: string;
  icon: LucideIcon;
  label: string;
  suggestedType: 'income' | 'expense' | 'both';
}

export const categoryIcons: CategoryIcon[] = [
  { id: 'shopping-cart', icon: ShoppingCart, label: 'Groceries', suggestedType: 'expense' },
  { id: 'home', icon: Home, label: 'Housing/Rent', suggestedType: 'expense' },
  { id: 'dollar-sign', icon: DollarSign, label: 'Salary', suggestedType: 'income' },
  { id: 'trending-up', icon: TrendingUp, label: 'Investment', suggestedType: 'both' },
  { id: 'car', icon: Car, label: 'Car', suggestedType: 'expense' },
  { id: 'coffee', icon: Coffee, label: 'Coffee & Restaurants', suggestedType: 'expense' },
  { id: 'credit-card', icon: CreditCard, label: 'Credit Card', suggestedType: 'expense' },
  { id: 'smartphone', icon: Smartphone, label: 'Phone & Internet', suggestedType: 'expense' },
  { id: 'medical-cross', icon: Cross, label: 'Healthcare', suggestedType: 'expense' },
  { id: 'gamepad-2', icon: Gamepad2, label: 'Entertainment', suggestedType: 'expense' },
  { id: 'shopping-bag', icon: ShoppingBag, label: 'Shopping', suggestedType: 'expense' },
  { id: 'plane', icon: Plane, label: 'Travel', suggestedType: 'expense' },
  { id: 'baby', icon: Baby, label: 'Baby & Kids', suggestedType: 'expense' },
  { id: 'gym', icon: Dumbbell, label: 'Fitness', suggestedType: 'expense' },
  { id: 'pizza', icon: Pizza, label: 'Food & Dining', suggestedType: 'expense' },
  { id: 'hand-coins', icon: HandCoins, label: 'Freelance', suggestedType: 'income' },
  { id: 'building-2', icon: Building2, label: 'Business', suggestedType: 'both' },
  { id: 'education', icon: GraduationCap, label: 'Education', suggestedType: 'expense' },
  { id: 'gift', icon: Gift, label: 'Gifts', suggestedType: 'both' },
  { id: 'heart', icon: Heart, label: 'Health & Beauty', suggestedType: 'expense' },
  { id: 'factory', icon: Factory, label: 'Business Income', suggestedType: 'income' },
  { id: 'warehouse', icon: Warehouse, label: 'Real Estate', suggestedType: 'both' },
  { id: 'receipt', icon: Receipt, label: 'Bills & Utilities', suggestedType: 'expense' },
  { id: 'wrench', icon: Wrench, label: 'Repairs', suggestedType: 'expense' },
  { id: 'wine', icon: Wine, label: 'Wine & Spirits', suggestedType: 'expense' },
  { id: 'bus', icon: Bus, label: 'Public Transport', suggestedType: 'expense' },
  { id: 'car-taxi-front', icon: CarTaxiFront, label: 'Taxi & Rides', suggestedType: 'expense' },
  { id: 'train', icon: Train, label: 'Train', suggestedType: 'expense' },
  { id: 'fuel', icon: Fuel, label: 'Fuel', suggestedType: 'expense' },
  { id: 'drumstick', icon: Drumstick, label: 'Meat & Protein', suggestedType: 'expense' },
  { id: 'beef', icon: Beef, label: 'Groceries Meat', suggestedType: 'expense' },
  { id: 'beer', icon: Beer, label: 'Bar & Alcohol', suggestedType: 'expense' },
  { id: 'film', icon: Film, label: 'Movies & Shows', suggestedType: 'expense' },
  { id: 'tv', icon: Tv, label: 'Television', suggestedType: 'expense' },
  { id: 'music-2', icon: Music2, label: 'Music & Audio', suggestedType: 'expense' },
  { id: 'monitor-smartphone', icon: MonitorSmartphone, label: 'Electronics', suggestedType: 'expense' },
  { id: 'wifi', icon: Wifi, label: 'Internet', suggestedType: 'expense' },
  { id: 'hotel', icon: Hotel, label: 'Hotels', suggestedType: 'expense' },
  { id: 'sofa', icon: Sofa, label: 'Furniture', suggestedType: 'expense' },
  { id: 'plant-2', icon: Flower2, label: 'Garden & Plants', suggestedType: 'expense' },
  { id: 'palette', icon: Palette, label: 'Arts & Crafts', suggestedType: 'expense' },
  { id: 'scissors', icon: Scissors, label: 'Hair & Beauty', suggestedType: 'expense' },
  { id: 'glasses', icon: Glasses, label: 'Eyewear', suggestedType: 'expense' },
  { id: 'pill', icon: Pill, label: 'Medications', suggestedType: 'expense' },
  { id: 'stethoscope', icon: Stethoscope, label: 'Medical Services', suggestedType: 'expense' },
  { id: 'newspaper', icon: Newspaper, label: 'Subscriptions', suggestedType: 'expense' },
  { id: 'pencil', icon: Pencil, label: 'Education Supplies', suggestedType: 'expense' },
  { id: 'library', icon: Library, label: 'Books & Learning', suggestedType: 'expense' },
  { id: 'trophy', icon: Trophy, label: 'Sports', suggestedType: 'expense' },
  { id: 'ticket', icon: Ticket, label: 'Events & Tickets', suggestedType: 'expense' },
  { id: 'wallet', icon: Wallet, label: 'Wallet', suggestedType: 'both' },
  { id: 'lightbulb', icon: Lightbulb, label: 'Utilities', suggestedType: 'expense' }
];

// Helper function to get icon by ID
export const getCategoryIconById = (id: string): CategoryIcon | undefined => {
  return categoryIcons.find(icon => icon.id === id);
};

// Helper function to get icons by type
export const getCategoryIconsByType = (type: 'income' | 'expense' | 'both'): CategoryIcon[] => {
  return categoryIcons.filter(icon => icon.suggestedType === type || icon.suggestedType === 'both');
};

// Component to render a category icon
export interface CategoryIconProps {
  iconId: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const CategoryIconComponent: React.FC<CategoryIconProps> = ({ 
  iconId, 
  className = "", 
  size = 24, 
  style
}) => {
  const categoryIcon = getCategoryIconById(iconId);
  if (!categoryIcon) return null;
  
  const IconComponent = categoryIcon.icon;
  return <IconComponent className={className} size={size} style={style} />;
}; 