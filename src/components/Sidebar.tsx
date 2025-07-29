import { motion, AnimatePresence } from 'framer-motion';
import { X, Scroll, Clock, Calendar, User, Settings, Info, BookOpen, Mail, HelpCircle, Database, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { icon: Scroll, label: 'Historical Timeline', href: '/' },
    { icon: Clock, label: 'Time Periods', href: '/' },
    { icon: Calendar, label: 'Events Calendar', href: '/' },
    { icon: User, label: 'Personal Archive', href: '/' },
    { icon: BookOpen, label: 'Reading List', href: '/' },
    { icon: Database, label: 'Data Sources', href: '/sources' },
    { icon: Info, label: 'About Us', href: '/about' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { icon: Mail, label: 'Contact', href: '/contact' },
    { icon: Settings, label: 'Settings', href: '/' },
    { icon: Shield, label: 'Legal', href: '/' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-background border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-serif font-bold text-museum-gold">Menu</h2>
                <p className="text-sm text-muted-foreground">Navigate PastPeek</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full">
              {/* Navigation Items */}
              <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link 
                        to={item.href}
                        onClick={onClose}
                        className="w-full flex items-center gap-4 p-3 rounded-lg text-left hover:bg-card/50 transition-colors group block"
                      >
                        <Icon className="w-5 h-5 text-museum-gold group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Scroll className="w-4 h-4 text-museum-gold" />
                    <span className="text-sm font-medium text-museum-gold">PastPeek</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digital Time Museum
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By Create Origins
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}