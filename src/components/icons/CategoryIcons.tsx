import React from 'react';
import {
  // Material Design Icons
  MdShoppingCart,
  MdHome,
  MdAttachMoney,
  MdTrendingUp,
  MdDirectionsCar,
  MdLocalCafe,
  MdCreditCard,
  MdPhone,
  MdLocalHospital,
  MdVideogameAsset,
  MdShoppingBag,
  MdFlight,
  MdBusiness,
  MdFactory,
  MdReceipt,
  MdBuild
} from 'react-icons/md';
import {
  // Font Awesome Icons
  FaBaby,
  FaBeer,
  FaDumbbell,
  FaHandHoldingUsd,
  FaGraduationCap,
  FaGift,
  FaHeart,
  FaWarehouse,
  FaWineGlassAlt,
  FaBus,
  FaTaxi,
  FaTrain,
  FaGasPump,
  FaDrumstickBite,
  FaHamburger,
  FaFilm,
  FaTv,
  FaMusic,
  FaLaptop,
  FaWifi,
  FaBed,
  FaCouch,
  FaSeedling,
  FaPaintBrush,
  FaCut,
  FaGlasses,
  FaPills,
  FaStethoscope,
  FaNewspaper,
  FaPencilAlt,
  FaBook,
  FaTrophy,
  FaTicketAlt,
  FaWallet,
  FaLightbulb
} from 'react-icons/fa';

export interface CategoryIcon {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  label: string;
  suggestedType: 'income' | 'expense' | 'both';
}

export const categoryIcons: CategoryIcon[] = [
  { id: 'shopping-cart', icon: MdShoppingCart, label: 'Groceries', suggestedType: 'expense' },
  { id: 'home', icon: MdHome, label: 'Housing/Rent', suggestedType: 'expense' },
  { id: 'dollar-sign', icon: MdAttachMoney, label: 'Salary', suggestedType: 'income' },
  { id: 'trending-up', icon: MdTrendingUp, label: 'Investment', suggestedType: 'both' },
  { id: 'car', icon: MdDirectionsCar, label: 'Car', suggestedType: 'expense' },
  { id: 'coffee', icon: MdLocalCafe, label: 'Coffee & Restaurants', suggestedType: 'expense' },
  { id: 'credit-card', icon: MdCreditCard, label: 'Credit Card', suggestedType: 'expense' },
  { id: 'smartphone', icon: MdPhone, label: 'Phone & Internet', suggestedType: 'expense' },
  { id: 'medical-cross', icon: MdLocalHospital, label: 'Healthcare', suggestedType: 'expense' },
  { id: 'gamepad-2', icon: MdVideogameAsset, label: 'Entertainment', suggestedType: 'expense' },
  { id: 'shopping-bag', icon: MdShoppingBag, label: 'Shopping', suggestedType: 'expense' },
  { id: 'plane', icon: MdFlight, label: 'Travel', suggestedType: 'expense' },
  { id: 'baby', icon: FaBaby, label: 'Baby & Kids', suggestedType: 'expense' },
  { id: 'gym', icon: FaDumbbell, label: 'Fitness', suggestedType: 'expense' },
  { id: 'pizza', icon: FaHamburger, label: 'Food & Dining', suggestedType: 'expense' },
  { id: 'hand-coins', icon: FaHandHoldingUsd, label: 'Freelance', suggestedType: 'income' },
  { id: 'building-2', icon: MdBusiness, label: 'Business', suggestedType: 'both' },
  { id: 'education', icon: FaGraduationCap, label: 'Education', suggestedType: 'expense' },
  { id: 'gift', icon: FaGift, label: 'Gifts', suggestedType: 'both' },
  { id: 'heart', icon: FaHeart, label: 'Health & Beauty', suggestedType: 'expense' },
  { id: 'factory', icon: MdFactory, label: 'Business Income', suggestedType: 'income' },
  { id: 'warehouse', icon: FaWarehouse, label: 'Real Estate', suggestedType: 'both' },
  { id: 'receipt', icon: MdReceipt, label: 'Bills & Utilities', suggestedType: 'expense' },
  { id: 'wrench', icon: MdBuild, label: 'Repairs', suggestedType: 'expense' },
  { id: 'wine', icon: FaWineGlassAlt, label: 'Wine & Spirits', suggestedType: 'expense' },
  { id: 'bus', icon: FaBus, label: 'Public Transport', suggestedType: 'expense' },
  { id: 'car-taxi-front', icon: FaTaxi, label: 'Taxi & Rides', suggestedType: 'expense' },
  { id: 'train', icon: FaTrain, label: 'Train', suggestedType: 'expense' },
  { id: 'fuel', icon: FaGasPump, label: 'Fuel', suggestedType: 'expense' },
  { id: 'drumstick', icon: FaDrumstickBite, label: 'Meat & Protein', suggestedType: 'expense' },
  { id: 'beef', icon: FaHamburger, label: 'Groceries Meat', suggestedType: 'expense' },
  { id: 'beer', icon: FaBeer, label: 'Bar & Alcohol', suggestedType: 'expense' },
  { id: 'film', icon: FaFilm, label: 'Movies & Shows', suggestedType: 'expense' },
  { id: 'tv', icon: FaTv, label: 'Television', suggestedType: 'expense' },
  { id: 'music-2', icon: FaMusic, label: 'Music & Audio', suggestedType: 'expense' },
  { id: 'monitor-smartphone', icon: FaLaptop, label: 'Electronics', suggestedType: 'expense' },
  { id: 'wifi', icon: FaWifi, label: 'Internet', suggestedType: 'expense' },
  { id: 'hotel', icon: FaBed, label: 'Hotels', suggestedType: 'expense' },
  { id: 'sofa', icon: FaCouch, label: 'Furniture', suggestedType: 'expense' },
  { id: 'plant-2', icon: FaSeedling, label: 'Garden & Plants', suggestedType: 'expense' },
  { id: 'palette', icon: FaPaintBrush, label: 'Arts & Crafts', suggestedType: 'expense' },
  { id: 'scissors', icon: FaCut, label: 'Hair & Beauty', suggestedType: 'expense' },
  { id: 'glasses', icon: FaGlasses, label: 'Eyewear', suggestedType: 'expense' },
  { id: 'pill', icon: FaPills, label: 'Medications', suggestedType: 'expense' },
  { id: 'stethoscope', icon: FaStethoscope, label: 'Medical Services', suggestedType: 'expense' },
  { id: 'newspaper', icon: FaNewspaper, label: 'Subscriptions', suggestedType: 'expense' },
  { id: 'pencil', icon: FaPencilAlt, label: 'Education Supplies', suggestedType: 'expense' },
  { id: 'library', icon: FaBook, label: 'Books & Learning', suggestedType: 'expense' },
  { id: 'trophy', icon: FaTrophy, label: 'Sports', suggestedType: 'expense' },
  { id: 'ticket', icon: FaTicketAlt, label: 'Events & Tickets', suggestedType: 'expense' },
  { id: 'wallet', icon: FaWallet, label: 'Wallet', suggestedType: 'both' },
  { id: 'lightbulb', icon: FaLightbulb, label: 'Utilities', suggestedType: 'expense' },
  { id: 'tag', icon: MdShoppingCart, label: 'General', suggestedType: 'both' }
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