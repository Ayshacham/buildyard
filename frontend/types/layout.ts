export type MenuItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: MenuItem[];
};